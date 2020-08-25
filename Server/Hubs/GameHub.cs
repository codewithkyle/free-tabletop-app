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
        Player player = new Player();

        [HubMethodName("Create:Room")]
        public async Task CreateRoom()
        {
            Room room = new Room();
            room.RoomCode = this.GenerateRoomCode();
            this.player.Name = "GM";
            room.AddPlayer(player);
            GlobalData.Rooms.Add(room);
            await Groups.AddToGroupAsync(Context.ConnectionId, room.RoomCode);
            await Clients.Caller.SendAsync("Load:GM", room.RoomCode);
        }

        [HubMethodName("Player:LookupRoom")]
        public async Task LookupRoom(string roomCode)
        {
            Room room = this.GetRoom(roomCode);
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
            Room room = this.GetRoom(roomCode);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Error:RoomNotFound");
                return;
            }
            player.Name = name;
            room.AddPlayer(player);
            await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);
            await Clients.Caller.SendAsync("Load:Player", roomCode);
        }

        private Room GetRoom(string roomCode)
        {
            List<Room> rooms = GlobalData.Rooms;
            Room room = null;
            for (int i = 0; i < rooms.Count; i++)
            {
                if (rooms[i].RoomCode == roomCode.ToUpper())
                {
                    room = rooms[i];
                    break;
                }
            }
            return room;
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