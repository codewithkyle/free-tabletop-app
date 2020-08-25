
using System;
using FreeTabletop.Server.Models;
using System.Collections.Generic;

public static class GlobalData
{
    public static List<Room> Rooms = new List<Room>();
    public static List<Player> Players = new List<Player>();

    public static void RemoveRoom(string roomCode)
    {
        for (int i = Rooms.Count - 1; i >= 0; i--)
        {
            if (Rooms[i].RoomCode == roomCode)
            {
                Rooms.RemoveAt(i);
                break;
            }
        }
    }

    public static void RemovePlayer(string connectionId)
    {
        for (int i = Players.Count - 1; i >= 0; i--)
        {
            if (Players[i].UID == connectionId)
            {
                if (!String.IsNullOrEmpty(Players[i].RoomCode))
                {
                    Room room = GetRoom(Players[i].RoomCode);
                    if (room != null)
                    {
                        room.RemovePlayer(Players[i]);
                    }
                }
                Players.RemoveAt(i);
                break;
            }
        }
    }

    public static Room GetRoom(string roomCode)
    {
        Room room = null;
        for (int i = 0; i < Rooms.Count; i++)
        {
            if (Rooms[i].RoomCode == roomCode.ToUpper())
            {
                room = Rooms[i];
                break;
            }
        }
        return room;
    }
}