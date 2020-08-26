using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using FreeTabletop.Server.Models;
using FreeTabletop.Shared.Models;

namespace FreeTabletop.Server.Hubs
{
    public class GameHub : Hub
    {
        [HubMethodName("Room:KickPlayer")]
        public async Task KickPlayer(string playerUID)
        {
            Player playerToKick = this.GetPlayer(playerUID);
            Player playerSendingCommand = this.GetPlayer(Context.ConnectionId);
            if (playerToKick != null && playerSendingCommand != null && playerSendingCommand.IsGameMaster && playerToKick.RoomCode == playerSendingCommand.RoomCode)
            {
                Room room = this.GetRoom(playerToKick.RoomCode);
                if (room != null)
                {
                    await Groups.RemoveFromGroupAsync(playerToKick.UID, playerToKick.RoomCode);
                    room.KickPlayer(playerToKick);
                    playerToKick.RoomCode = null;
                    GlobalData.RemovePlayer(playerToKick);
                    await Clients.Client(playerToKick.UID).SendAsync("Player:Kick");
                    await SendTabletopInfo(room);
                }
            }
        }

        [HubMethodName("Player:IsGameMaster")]
        public async Task CheckIfPlayerIsGameMaster()
        {
            Player player = this.GetPlayer(Context.ConnectionId);
            if (player != null)
            {
                await Clients.Caller.SendAsync("Set:IsGameMaster", player.IsGameMaster);
            }
        }

        [HubMethodName("Room:ToggleLock")]
        public async Task ToggleRoomLock()
        {
            Player player = this.GetPlayer(Context.ConnectionId);
            if (player != null && player.IsGameMaster)
            {
                Room room = this.GetRoom(player.RoomCode);
                if (room != null)
                {
                    room.ToggleLock();
                    await SendTabletopInfo(room);
                }
            }
        }

        [HubMethodName("Player:SyncTabletopInfo")]
        public async Task SyncPlayersTabletopInfo()
        {
            Player player = this.GetPlayer(Context.ConnectionId);
            if (player != null)
            {
                Room room = this.GetRoom(player.RoomCode);
                if (room != null)
                {
                    await SendTabletopInfo(room);
                }
            }
        }

        [HubMethodName("Player:Resync")]
        public async Task ResyncPlayer(string roomCode, string staleUID)
        {
            Room room = GlobalData.GetRoom(roomCode);
            if (room != null)
            {
                Player player = GlobalData.GetPlayerByStaleUID(staleUID);
                if (player != null)
                {
                    player.IsConnected = true;
                    player.UID = Context.ConnectionId;
                    await Clients.Caller.SendAsync("Set:PlayerUID", Context.ConnectionId);
                }
                else
                {
                    await Clients.Caller.SendAsync("Error:PlayerNotFound");
                }
            }
            else
            {
                await Clients.Caller.SendAsync("Error:RoomNotFound");
            }
        }

        [HubMethodName("Create:Room")]
        public async Task CreateRoom()
        {
            Room room = new Room();
            room.RoomCode = GenerateRoomCode();
            room.IsLocked = false;

            Player player = new Player();
            player.Name = "GM";
            player.UID = Context.ConnectionId;
            player.RoomCode = room.RoomCode;
            player.IsConnected = true;
            player.IsGameMaster = true;

            GlobalData.Players.Add(player);
            room.AddPlayer(player);
            GlobalData.Rooms.Add(room);

            await Groups.AddToGroupAsync(Context.ConnectionId, room.RoomCode);
            await Clients.Caller.SendAsync("Load:GM", room.RoomCode, Context.ConnectionId);
        }

        [HubMethodName("Player:LookupRoom")]
        public async Task LookupRoom(string roomCode)
        {
            Room room = GlobalData.GetRoom(roomCode);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Error:RoomNotFound");
                return;
            }
            if (room.IsLocked)
            {
                await Clients.Caller.SendAsync("Error:RoomIsLocked");
            }
            else
            {
                await Clients.Caller.SendAsync("Get:PlayerName");
            }
        }

        [HubMethodName("Player:JoinRoom")]
        public async Task JoinRoom(string roomCode, string name)
        {
            Room room = GlobalData.GetRoom(roomCode);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Error:RoomNotFound");
                return;
            }
            Player player = new Player();
            player.Name = name;
            player.UID = Context.ConnectionId;
            player.RoomCode = room.RoomCode;
            player.IsConnected = true;
            GlobalData.Players.Add(player);
            room.AddPlayer(player);
            await Groups.AddToGroupAsync(Context.ConnectionId, room.RoomCode);
            await Clients.Caller.SendAsync("Load:Player", roomCode, Context.ConnectionId);
            await SendTabletopInfo(room);
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await base.OnDisconnectedAsync(exception);
            GlobalData.DisconnectPlayer(Context.ConnectionId);
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

        private string GenerateRoomCode()
        {
            string abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            Random random = new Random();
            string roomCode = "";
            for (int i = 0; i < 6; i++)
            {
                int index = random.Next(abc.Length);
                roomCode += abc[index];
            }
            return roomCode;
        }

        private async Task SendTabletopInfo(Room room)
        {
            List<PlayerEntity> players = new List<PlayerEntity>();
            for (int i = 0; i < room.Players.Count; i++)
            {
                if (!room.Players[i].IsGameMaster)
                {
                    PlayerEntity player = new PlayerEntity();
                    player.UID = room.Players[i].UID;
                    player.Name = room.Players[i].Name;
                    player.Type = "player";
                    players.Add(player);
                }
            }
            await Clients.Group(room.RoomCode).SendAsync("Sync:TabletopInfo", room.IsLocked, players);
        }
    }
}