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
        public async Task CreateRoom()
        {
            Room room = new Room();
            GlobalData.Rooms.Add(room);
            await Groups.AddToGroupAsync(Context.ConnectionId, room.RoomCode);
            await Clients.Caller.SendAsync("Init", room.RoomCode);
        }

        public async Task JoinRoom(string roomCode)
        {
            bool foundRoom = false;
            List<Room> rooms = GlobalData.Rooms;
            for (int i = 0; i < rooms.Count; i++)
            {
                if (rooms[i].RoomCode == roomCode)
                {
                    foundRoom = true;
                    break;
                }
            }
            if (foundRoom)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);
                await Clients.Caller.SendAsync("Init", roomCode);
            }
            else
            {
                await Clients.Caller.SendAsync("RoomNotFound");
            }
        }
    }
}