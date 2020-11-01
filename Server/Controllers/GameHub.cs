using System;
using System.Collections.Generic;
using System.Linq;
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
            GlobalData.DisconnectPlayer(Context.ConnectionId);
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, room.RoomCode);
                    await SendPlayerDisconnectionNotification(room, player.Name);
                    await SendTabletopInfoToRoom(room);
                }
            }
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
                await Clients.Caller.SendAsync("Set:PlayerStatus", player.IsGameMaster, player.UID);
            }
        }

        [HubMethodName("Room:ToggleLock")]
        public async Task ToggleRoomLock()
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null && player.IsGameMaster)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    room.ToggleLock();
                    await SendTabletopInfoToRoom(room);
                }
            }
        }

        [HubMethodName("Room:LoadImage")]
        public async Task LoadImage(String imageURL, string gridType, int[] gridSize)
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null && player.IsGameMaster)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    room.LoadImage(imageURL, gridType, gridSize);
                    await ClearTabletop(room);
                    await LoadTabletopImage(room);
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

        [HubMethodName("Room:MoveEntity")]
        public async Task MoveEntity(string entityUid, int[] newPosition)
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null)
            {
                if (player.UID == entityUid || player.IsGameMaster)
                {
                    Room room = GetRoom(player.RoomCode);
                    if (room != null)
                    {
                        if (room.IsPositionValid(newPosition))
                        {
                            room.UpdateEntityPosition(entityUid, newPosition);
                            await RenderPlayerEntities(room);
                            await RenderCreatureEntities(room);
                            await RenderNPCEntities(room);
                        }
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
                    }
                }
            }
        }

        [HubMethodName("Room:Ping")]
        public async Task Ping(double x, double y)
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
                    await SendTabletopInfoToRoom(room);
                    if (!player.IsGameMaster)
                    {
                        List<Message> Messages = room.GetPlayerMessages(player.UID);
                        await Clients.Caller.SendAsync("Set:Messages", Messages);
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
                }
                else
                {
                    await Clients.Caller.SendAsync("Error:PlayerNotFound");
                }
            }
        }

        [HubMethodName("Player:Message")]
        public async Task Message(string msg, string targetPlayerUID)
        {
            Player player = GetPlayer(Context.ConnectionId);
            Player recievingPlayer = GetPlayer(targetPlayerUID);
            Room room = GetRoom(player.RoomCode);
            if (room != null)
            {
                if (player.IsGameMaster)
                {
                    List<Message> Messages = room.MessagePlayer(targetPlayerUID, msg, player.Name);
                    await Clients.Client(recievingPlayer.UID).SendAsync("Set:Messages", Messages);

                    List<PlayerEntity> players = room.BuildPlayerEntities();
                    await Clients.Caller.SendAsync("Set:Players", players);
                }
                else
                {
                    List<Message> Messages = room.MessagePlayer(player.UID, msg, player.Name);
                    await Clients.Caller.SendAsync("Set:Messages", Messages);

                    List<PlayerEntity> players = room.BuildPlayerEntities();
                    await Clients.Client(recievingPlayer.UID).SendAsync("Set:Players", players);
                }
            }
        }

        [HubMethodName("Create:Room")]
        public async Task CreateRoom()
        {
            string roomCode = GlobalData.CreateRoom(Context.ConnectionId);
            await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);
            await Clients.Caller.SendAsync("Load:GM", roomCode, Context.ConnectionId);
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
            await Clients.Group(room.RoomCode).SendAsync("Sync:TabletopInfo", room.IsLocked, players, gameMaster.UID);
            
            if (room.ImageURL != null && room.ImageURL.Length != 0)
            {
                await LoadTabletopImage(room);
                if (room.GridType != "3")
                {
                    await RenderPlayerEntities(room);
                    await RenderCreatureEntities(room);
                    await RenderNPCEntities(room);
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
            await Clients.Group(room.RoomCode).SendAsync("Tabletop:LoadImage", room.ImageURL, room.GridType, room.Grid);
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

        private async Task RenderNPCEntities(Room room)
        {
            await Clients.Group(room.RoomCode).SendAsync("Tabletop:RenderNPCEntities", room.NPCs);
        }

        private async Task SendPlayerConnectionNotification(Room room, string name)
        {
            await Clients.Group(room.RoomCode).SendAsync("Notification:PlayerConnected", name);
        }

        private async Task SendPlayerDisconnectionNotification(Room room, string name)
        {
            await Clients.Group(room.RoomCode).SendAsync("Notification:PlayerDisconnected", name);
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

        private async Task SendPing(Room room, double x, double y)
        {
            await Clients.Group(room.RoomCode).SendAsync("Notification:Ping", x, y);
        }
    }
}