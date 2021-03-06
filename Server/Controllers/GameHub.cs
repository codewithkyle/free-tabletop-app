using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using FreeTabletop.Server.Models;
using FreeTabletop.Shared.Models;

namespace FreeTabletop.Server.Controllers
{
    public class GameHub : Hub
    {
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null && player.IsConnected)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, room.RoomCode);
                    await SendPlayerDisconnectionNotification(room, player.Name, player.UID);
                }
            }
            GlobalData.DisconnectPlayer(Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }

        [HubMethodName("Room:KickPlayer")]
        public async Task KickPlayer(string playerUID)
        {
            Player playerToKick = GetPlayer(playerUID);
            Player playerSendingCommand = GetPlayer(Context.ConnectionId);
            if (playerToKick != null && playerSendingCommand != null && playerSendingCommand.IsGameMaster && playerToKick.RoomCode == playerSendingCommand.RoomCode)
            {
                Room room = GetRoom(playerToKick.RoomCode);
                if (room != null)
                {
                    await Groups.RemoveFromGroupAsync(playerToKick.UID, playerToKick.RoomCode);
                    room.KickPlayer(playerToKick);
                    GlobalData.RemovePlayer(playerToKick);
                    await Clients.Client(playerToKick.UID).SendAsync("Player:Kick");
                    await SendPlayerKickNotification(room, playerToKick.Name);
                    await SendTabletopInfoToRoom(room);
                }
            }
        }

        [HubMethodName("Player:GetStatus")]
        public async Task CheckIfPlayerIsGameMaster()
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null)
            {
                await Clients.Caller.SendAsync("Set:PlayerStatus", player.IsGameMaster, player.UID, player.MessageUID);
            }
        }

        [HubMethodName("Room:ToggleLock")]
        public void ToggleRoomLock()
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null && player.IsGameMaster)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    room.ToggleLock();
                    Clients.Group(room.RoomCode).SendAsync("Tabletop:UpdateLock", room.IsLocked);
                }
            }
        }

        [HubMethodName("Room:ToggleDiceRolls")]
        public void ToggleDiceRolls()
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null && player.IsGameMaster)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    room.ToggleDiceRolls();
                    Clients.Group(room.RoomCode).SendAsync("Tabletop:UpdateDiceRolls", room.IsLocalDiceRolls);
                }
            }
        }

        [HubMethodName("Room:ToggleVisibility")]
        public void ToggleSceneVisibility()
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null && player.IsGameMaster)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    room.ToggleSceneVisibility();
                    Clients.Group(room.RoomCode).SendAsync("Tabletop:ToggleVisibility", room.IsHidden);
                }
            }
        }

        [HubMethodName("Room:ChangeCellStyle")]
        public void ChangeCellStyles(int index, string style)
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    room.UpdateCellStyle(index, style);
                    Clients.Group(room.RoomCode).SendAsync("Tabletop:SyncCells", index, style);
                }
            }
        }

        [HubMethodName("Room:LoadPopupImage")]
        public void LoadPopupImage(string url, string label)
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null && player.IsGameMaster)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    Image Image = new Image();
                    Image.URL = url;
                    if (!String.IsNullOrEmpty(label))
                    {
                        Image.Label = label;
                    }
                    else
                    {
                        Image.Label = url;
                    }
                    bool isNew = room.AddPopupImage(Image);
                    if (isNew)
                    {
                        Clients.Group(room.RoomCode).SendAsync("Tabletop:LoadPopupImage", Image);
                    }
                }
            }
        }

        [HubMethodName("Room:LoadImage")]
        public async Task LoadImage(String imageURL, string gridType, int[] gridSize, int cellSize, int[] tabletopSize, bool fogOfWar, bool advanced, bool pvp)
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null && player.IsGameMaster)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    room.ClearTabletop();
                    room.LoadImage(imageURL, gridType, gridSize, cellSize, tabletopSize, fogOfWar, advanced, pvp);
                    await RenderCreatureEntities(room);
                    await RenderNPCEntities(room);
                    await LoadTabletopImage(room);
                    await RenderLightEntities(room);
                    if (gridType != "3")
                    {
                        room.ResetPlayerPawnPositions();
                        await RenderPlayerEntities(room);
                    }
                }
            }
        }

        [HubMethodName("Room:ClearTabletop")]
        public async Task ClearRoomsTabletop()
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null && player.IsGameMaster)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    room.ClearTabletop();
                    await ClearTabletop(room);
                }
            }
        }

        [HubMethodName("Room:RemoveEntity")]
        public async Task RemoveEntity(string uid)
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null && player.IsGameMaster)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    room.RemoveEntity(uid);
                    await RenderCreatureEntities(room);
                    await RenderNPCEntities(room);
                    await RenderLightEntities(room);
                }
            }
        }

        [HubMethodName("Room:MoveEntity")]
        public void MoveEntity(string entityUid, int[] newPosition)
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null)
            {
                if (player.UID == entityUid || player.IsGameMaster)
                {
                    Room room = GetRoom(player.RoomCode);
                    if (room != null)
                    {
                        room.UpdateEntityPosition(entityUid, newPosition);
                        UpdateEntityPosition(room, entityUid, newPosition);
                    }
                }
            }
        }

        [HubMethodName("Entity:ToggleCondition")]
        public async Task ToggleCondition(string uid, string condition)
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null && player.IsGameMaster)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    Entity entity = room.ToggleCondition(uid, condition);
                    if (entity != null)
                    {
                        await Clients.Group(room.RoomCode).SendAsync("Entity:UpdateCondition", entity, condition);
                    }
                }
            }
        }

        [HubMethodName("Entity:ToggleVisibility")]
        public async Task ToggleVisibility(string uid)
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null && player.IsGameMaster)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    Entity entity = room.ToggleVisibility(uid);
                    if (entity != null)
                    {
                        await Clients.Group(room.RoomCode).SendAsync("Entity:ToggleVisibility", entity);
                    }
                }
            }
        }

        [HubMethodName("Room:SpawnCreature")]
        public async Task SpawnCreature(Creature creature)
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null && player.IsGameMaster)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    room.SpawnCreature(creature);
                    await RenderCreatureEntities(room);
                }
            }
        }

        [HubMethodName("Room:SpawnLight")]
        public async Task SpawnLight(int x, int y)
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null && player.IsGameMaster)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    room.SpawnLight(x, y);
                    await RenderLightEntities(room);
                }
            }
        }

        [HubMethodName("Room:SpawnNPC")]
        public async Task SpawnNPC(NPC npc)
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null && player.IsGameMaster)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    room.SpawnNPC(npc);
                    await RenderNPCEntities(room);
                }
            }
        }

        [HubMethodName("Room:SyncCombatOrder")]
        public async Task SyncCombatOrder()
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null && player.IsGameMaster)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    List<Entity> CombatOrder = room.BuildCombatOrder();
                    await SendCombatOrder(room, CombatOrder);
                }
            }
        }

        [HubMethodName("Room:UpdateEntityCombatOrderPosition")]
        public async Task UpdateEntityCombatOrderPosition(string uid, int newPosition)
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null && player.IsGameMaster)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    List<Entity> CombatOrder = room.UpdateCombatOrder(uid, newPosition);
                    await SendCombatOrder(room, CombatOrder);
                }
            }
        }

        [HubMethodName("Room:RemoveEntityFromCombatOrder")]
        public async Task RemoveEntityFromCombatOrder(string uid)
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null && player.IsGameMaster)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    List<Entity> CombatOrder = room.RemoveEntityFromCombatOrder(uid);
                    await SendCombatOrder(room, CombatOrder);
                }
            }
        }

        [HubMethodName("Room:UpdateEntityAC")]
        public void UpdateEntityAC(string uid, int ac)
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null && player.IsGameMaster)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    room.UpdateEntityAC(uid, ac);
                }
            }
        }

        [HubMethodName("Room:UpdateEntityFoV")]
        public void UpdateEntityFoV(string uid, int fov)
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null && player.IsGameMaster)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    room.UpdateEntityFoV(uid, fov);
                    if (room.PvP)
                    {
                        Player targetPlayerEntity = GlobalData.GetPlayerByStaleUID(uid);
                        if (targetPlayerEntity != null)
                        {
                            Clients.Client(targetPlayerEntity.UID).SendAsync("Entity:UpdateFoV", uid, fov);
                        }
                        else
                        {
                            Clients.Group(room.RoomCode).SendAsync("Entity:UpdateFoV", uid, fov);
                        }
                    }
                    else
                    {
                        Clients.Group(room.RoomCode).SendAsync("Entity:UpdateFoV", uid, fov);
                    }
                }
            }
        }

        [HubMethodName("Room:UpdateEntityHP")]
        public async Task UpdateEntityHP(string uid, int hp)
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null && player.IsGameMaster)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    bool NeedsRerender = room.UpdateEntityHP(uid, hp);
                    if (NeedsRerender)
                    {
                        await RenderCreatureEntities(room);
                        await RenderNPCEntities(room);
                        if (hp == 0)
                        {
                            await Clients.Group(room.RoomCode).SendAsync("Entity:RenderDeathCelebration", uid);
                        }
                    }
                }
            }
        }

        [HubMethodName("Room:Ping")]
        public async Task Ping(int x, int y)
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    await SendPing(room, x, y);
                }
            }
        }

        [HubMethodName("Room:AnnounceRoll")]
        public void AnnounceRoll(int diceCount, string die, string results)
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null && !room.IsLocalDiceRolls)
                {
                    AnnounceRoll(room, diceCount, die, results, player.Name, player.UID);
                }
            }
        }

        [HubMethodName("Room:PingEntity")]
        public async Task PingEntity(string uid)
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null && player.IsGameMaster)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    Player PlayerToPing = GlobalData.GetPlayer(uid);
                    if (PlayerToPing != null)
                    {
                        if (player.RoomCode == PlayerToPing.RoomCode)
                        {
                            await Clients.Client(PlayerToPing.UID).SendAsync("Notification:TakeTurn");
                        }
                    }
                    List<Entity> CombatOrder = room.UpdateCombatOrderActiveEntity(uid);
                    await SendCombatOrder(room, CombatOrder);
                    PlayerEntity NextPlayer = room.GetNextActivePlayer(uid);
                    if (NextPlayer != null)
                    {
                        await Clients.Client(NextPlayer.UID).SendAsync("Notification:OnDeck");
                    }
                    else
                    {
                        string name = room.GetNextActiveEntityName(uid);
                        await SendEntityOnDeckNotification(room, name);
                    }
                }
            }
        }

        [HubMethodName("Player:SyncTabletopInfo")]
        public async Task SyncTabletopInfo()
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    List<PlayerEntity> players = room.BuildPlayerEntities();
                    Player gameMaster = room.GetGameMaster();
                    await Clients.Caller.SendAsync("Sync:TabletopInfo", room.IsLocked, players, gameMaster.MessageUID, room.IsHidden, room.Images);
                    
                    if (room.ImageURL != null && room.ImageURL.Length != 0)
                    {
                        await Clients.Caller.SendAsync("Tabletop:LoadImage", room.ImageURL, room.GridType, room.Grid, room.CellSize, room.TabletopSize, room.Cells, room.FoVFoW, room.PvP);
                        if (room.GridType != "3")
                        {
                            await Clients.Caller.SendAsync("Tabletop:RenderPlayerEntities", players);
                            await Clients.Caller.SendAsync("Tabletop:RenderCreatureEntities", room.Creatures);
                            await Clients.Caller.SendAsync("Tabletop:RenderNPCEntities", room.NPCs);
                            await Clients.Caller.SendAsync("Sync:CombatOrder", room.CombatOrder);
                        }
                    }
                }
            }
        }

        [HubMethodName("Player:Resync")]
        public async Task ResyncPlayer(string roomCode, string staleUID)
        {
            Room room = GetRoom(roomCode);
            if (room != null)
            {
                Player player = GlobalData.GetPlayerByStaleUID(staleUID);
                if (player != null)
                {
                    await SendPlayerReconnectionNotification(room, player.Name);
                    await Groups.AddToGroupAsync(Context.ConnectionId, room.RoomCode);
                    player.Reconnect(Context.ConnectionId);
                    await Clients.Caller.SendAsync("Set:PlayerUID", Context.ConnectionId);
                    await Clients.Caller.SendAsync("Set:PlayerStatus", player.IsGameMaster, player.UID, player.MessageUID);
                    await SendTabletopInfoToRoom(room);
                }
                else
                {
                    await Clients.Caller.SendAsync("Error:PlayerNotFound");
                }
            }
        }

        [HubMethodName("Room:Message")]
        public async Task AllChatMessage(string msg)
        {
            Player player = GetPlayer(Context.ConnectionId);
            Room room = GetRoom(player.RoomCode);
            if (room != null)
            {
                Message message = new Message();
                message.Author = player.Name;
                message.Msg = msg;
                message.RecipientUID = null;
                message.AuthorUID = player.MessageUID;
                await Clients.Group(room.RoomCode).SendAsync("Set:Message", message);
            }
        }

        [HubMethodName("Player:Message")]
        public async Task Message(string msg, string targetPlayerUID)
        {
            Player player = GetPlayer(Context.ConnectionId);
            Player recievingPlayer = GlobalData.GetPlayerByStaleUID(targetPlayerUID);
            Room room = GetRoom(player.RoomCode);
            if (room != null && recievingPlayer != null)
            {
                Message message = new Message();
                message.Author = player.Name;
                message.Msg = msg;
                message.RecipientUID = recievingPlayer.MessageUID;
                message.AuthorUID = player.MessageUID;
                await Clients.Client(recievingPlayer.UID).SendAsync("Set:Message", message);
                await Clients.Client(Context.ConnectionId).SendAsync("Set:Message", message);
            }
        }

        [HubMethodName("Create:Room")]
        public async Task CreateRoom()
        {
            string roomCode = GlobalData.CreateRoom(Context.ConnectionId);
            await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);
            await Clients.Caller.SendAsync("Load:GM", roomCode, Context.ConnectionId);
        }

        [HubMethodName("Player:Disconnect")]
        public async Task DisconnectPlayer()
        {
            GlobalData.DisconnectPlayer(Context.ConnectionId);
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, room.RoomCode);
                    await SendPlayerDisconnectionNotification(room, player.Name, player.UID);
                }
            }
        }

        [HubMethodName("Player:LookupRoom")]
        public async Task LookupRoom(string roomCode, string savedUID)
        {
            Room room = GetRoom(roomCode);
            if (room != null)
            {
                if (String.IsNullOrEmpty(savedUID))
                {
                    if (room.IsLocked)
                    {
                        await Clients.Caller.SendAsync("Error:RoomIsLocked");
                    }
                    else
                    {
                        await Clients.Caller.SendAsync("Get:PlayerName");
                    }
                }
                else
                {
                    Player player = GlobalData.GetPlayerByStaleUID(savedUID);
                    if (player != null)
                    {
                        if (room.IsLocked)
                        {
                            if (player.RoomCode == room.RoomCode)
                            {
                                await SendPlayerReconnectionNotification(room, player.Name);
                                await Groups.AddToGroupAsync(Context.ConnectionId, room.RoomCode);
                                player.Reconnect(Context.ConnectionId);
                                await Clients.Caller.SendAsync("Load:Player", room.RoomCode, Context.ConnectionId);
                            }
                            else
                            {
                                await Clients.Caller.SendAsync("Error:RoomIsLocked");
                            }
                            
                        }
                        else
                        {
                            if (player.RoomCode == room.RoomCode)
                            {
                                await SendPlayerReconnectionNotification(room, player.Name);
                                await Groups.AddToGroupAsync(Context.ConnectionId, room.RoomCode);
                                player.Reconnect(Context.ConnectionId);
                                await Clients.Caller.SendAsync("Load:Player", room.RoomCode, Context.ConnectionId);
                            }
                            else
                            {
                                await Clients.Caller.SendAsync("Get:PlayerName");
                            }
                        }
                    }
                    else
                    {
                        if (room.IsLocked)
                        {
                            await Clients.Caller.SendAsync("Error:RoomIsLocked");
                        }
                        else
                        {
                            await Clients.Caller.SendAsync("Get:PlayerName");
                        }
                    }
                }
            }
        }

        [HubMethodName("Player:JoinRoom")]
        public async Task JoinRoom(string roomCode, string name)
        {
            Room room = GetRoom(roomCode);
            if (room != null)
            {
                Player player = GlobalData.CreatePlayer(Context.ConnectionId, name, room.RoomCode);
                room.AddPlayer(player);
                await SendPlayerConnectionNotification(room, name);
                await Groups.AddToGroupAsync(Context.ConnectionId, room.RoomCode);
                await Clients.Caller.SendAsync("Load:Player", roomCode, Context.ConnectionId);
                await SendTabletopInfoToRoom(room);
            }
        }

        private Room GetRoom(string roomCode)
        {
            Room room = GlobalData.GetRoom(roomCode);
            if (room == null)
            {
                Clients.Caller.SendAsync("Error:RoomNotFound");
            }
            return room;
        }

        private Player GetPlayer(string uid)
        {
            Player player = GlobalData.GetPlayer(uid);
            if (player == null)
            {
                Clients.Caller.SendAsync("Error:PlayerNotFound");
            }
            return player;
        }

        private async Task SendTabletopInfoToRoom(Room room)
        {
            List<PlayerEntity> players = room.BuildPlayerEntities();
            Player gameMaster = room.GetGameMaster();
            await Clients.Group(room.RoomCode).SendAsync("Sync:TabletopInfo", room.IsLocked, players, gameMaster.MessageUID, room.IsHidden, room.Images);
            
            if (room.ImageURL != null && room.ImageURL.Length != 0)
            {
                await LoadTabletopImage(room);
                if (room.GridType != "3")
                {
                    await RenderPlayerEntities(room);
                    await RenderCreatureEntities(room);
                    await RenderNPCEntities(room);
                    await RenderLightEntities(room);
                    await SendCombatOrder(room, room.CombatOrder);
                }
            }
        }

        private async Task ClearTabletop(Room room)
        {
            await Clients.Group(room.RoomCode).SendAsync("Tabletop:Clear");
        }

        private async Task LoadTabletopImage(Room room)
        {
            await Clients.Group(room.RoomCode).SendAsync("Tabletop:LoadImage", room.ImageURL, room.GridType, room.Grid, room.CellSize, room.TabletopSize, room.Cells, room.FoVFoW, room.PvP);
        }

        private async Task RenderPlayerEntities(Room room)
        {
            List<PlayerEntity> players = room.BuildPlayerEntities();
            await Clients.Group(room.RoomCode).SendAsync("Tabletop:RenderPlayerEntities", players);
        }

        private async Task RenderCreatureEntities(Room room)
        {
            await Clients.Group(room.RoomCode).SendAsync("Tabletop:RenderCreatureEntities", room.Creatures);
        }

        private async Task RenderLightEntities(Room room)
        {
            await Clients.Group(room.RoomCode).SendAsync("Tabletop:RenderLightEntities", room.Lights);
        }

        private async Task RenderNPCEntities(Room room)
        {
            await Clients.Group(room.RoomCode).SendAsync("Tabletop:RenderNPCEntities", room.NPCs);
        }

        private async Task SendPlayerConnectionNotification(Room room, string name)
        {
            await Clients.Group(room.RoomCode).SendAsync("Notification:PlayerConnected", name);
        }

        private async Task SendPlayerDisconnectionNotification(Room room, string name, string playerUID)
        {
            await Clients.Group(room.RoomCode).SendAsync("Notification:PlayerDisconnected", name, playerUID);
        }

        private async Task SendPlayerReconnectionNotification(Room room, string name)
        {
            await Clients.Group(room.RoomCode).SendAsync("Notification:PlayerReconnected", name);
        }
        private async Task SendPlayerKickNotification(Room room, string name)
        {
            await Clients.Group(room.RoomCode).SendAsync("Notification:PlayerKicked", name);
        }

        private async Task SendCombatOrder(Room room, List<Entity> combatOrder)
        {
            await Clients.Group(room.RoomCode).SendAsync("Sync:CombatOrder", combatOrder);
        }

        private async Task SendEntityOnDeckNotification(Room room, string name)
        {
            await Clients.Group(room.RoomCode).SendAsync("Notification:EntityOnDeck", name);
        }

        private async Task SendPing(Room room, int x, int y)
        {
            await Clients.Group(room.RoomCode).SendAsync("Notification:Ping", x, y);
        }

        private void AnnounceRoll(Room room, int diceCount, string die, string results, string name, string callerUID)
        {
            for (int i = 0; i < room.Players.Count; i++)
            {
                if (room.Players[i].UID != callerUID)
                {
                    Clients.Client(room.Players[i].UID).SendAsync("Notification:Roll", diceCount, die, results, name);
                }
            }
        }

        private void UpdateEntityPosition(Room room, string uid, int[] position)
        {
            Clients.Group(room.RoomCode).SendAsync("Tabletop:UpdateEntityPosition", uid, position);
        }
    }
}