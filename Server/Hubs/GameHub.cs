using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using FreeTabletop.Server.Models;

namespace FreeTabletop.Server.Hubs
{
    public class GameHub : Hub
    {
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await base.OnDisconnectedAsync(exception);
            GlobalData.RemovePlayer(Context.ConnectionId);
        }

        [HubMethodName("Create:Room")]
        public async Task CreateRoom()
        {
            Room room = new Room();
            Player player = new Player();
            room.RoomCode = GenerateRoomCode();
            player.Name = "GM";
            player.UID = Context.ConnectionId;
            player.RoomCode = room.RoomCode;
            GlobalData.Players.Add(player);
            room.AddPlayer(player);
            GlobalData.Rooms.Add(room);
            await Groups.AddToGroupAsync(Context.ConnectionId, room.RoomCode);
            await Clients.Caller.SendAsync("Load:GM", room.RoomCode);
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
            await Clients.Caller.SendAsync("Get:PlayerName");
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
            GlobalData.Players.Add(player);
            room.AddPlayer(player);
            await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);
            await Clients.Caller.SendAsync("Load:Player", roomCode);
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
    }
}