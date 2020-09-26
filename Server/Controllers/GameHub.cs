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
            await base.OnDisconnectedAsync(exception);
            GlobalData.DisconnectPlayer(Context.ConnectionId);
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, room.RoomCode);
                    await SendTabletopInfoToRoom(room);
                }
            }
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
                    await SendTabletopInfoToRoom(room);
                }
            }
        }

        [HubMethodName("Player:IsGameMaster")]
        public async Task CheckIfPlayerIsGameMaster()
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null)
            {
                await Clients.Caller.SendAsync("Set:IsGameMaster", player.IsGameMaster);
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
        public async Task LoadImage(String imageURL, bool generateGrid)
        {
            Player player = GetPlayer(Context.ConnectionId);
            if (player != null && player.IsGameMaster)
            {
                Room room = GetRoom(player.RoomCode);
                if (room != null)
                {
                    room.LoadImage(imageURL, generateGrid);
                    await ClearTabletop(room);
                    await LoadTabletopImage(room);
                }
            }
        }

        [HubMethodName("Room:ClearTabletop")]
        public async Task ClearTabletop()
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
            await Clients.Group(room.RoomCode).SendAsync("Sync:TabletopInfo", room.IsLocked, players);
        }

        private async Task ClearTabletop(Room room)
        {
            await Clients.Group(room.RoomCode).SendAsync("Tabletop:Clear");
        }

        private async Task LoadTabletopImage(Room room)
        {
            await Clients.Group(room.RoomCode).SendAsync("Tabletop:LoadImage", room.ImageURL, room.GenerateGrid);
        }
    }
}