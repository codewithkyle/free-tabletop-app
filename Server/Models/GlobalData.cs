
using System;
using FreeTabletop.Server.Models;
using System.Collections.Generic;

public static class GlobalData
{
    public static List<Room> Rooms = new List<Room>();
    public static List<Player> Players = new List<Player>();

    public static void RemoveRoom(Room room)
    {
        for (int i = 0; i < room.Players.Count; i++)
        {
            RemovePlayer(room.Players[i]);
        }
        for (int i = Rooms.Count - 1; i >= 0; i--)
        {
            if (Rooms[i].RoomCode == room.RoomCode)
            {
                Rooms.RemoveAt(i);
                break;
            }
        }
    }

    public static void RemovePlayer(Player player)
    {
        for (int i = Players.Count - 1; i >= 0; i--)
        {
            if (Players[i].UID == player.UID)
            {
                Players.RemoveAt(i);
                break;
            }
        }
    }

    public static void DisconnectPlayer(string connectionId)
    {
        for (int i = 0; i < Players.Count; i++)
        {
            if (Players[i].UID == connectionId)
            {
                Players[i].IsConnected = false;
                Players[i].StaleUIDs.Add(Players[i].UID);
                if (Players[i].RoomCode != null)
                {
                    Room room = GetRoom(Players[i].RoomCode);
                    if (room != null)
                    {
                        room.CheckPlayerConnections();
                    }
                }
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

    public static Player GetPlayer(string uid)
    {
        Player player = null;
        for (int i = 0; i < Players.Count; i++)
        {
            if (Players[i].UID == uid)
            {
                player = Players[i];
                break;
            }
        }
        return player;
    }

    public static Player GetPlayerByStaleUID(string uid)
    {
        Player player = null;
        for (int i = 0; i < Players.Count; i++)
        {
            for (int j = 0; j < Players[i].StaleUIDs.Count; j++)
            {
                if (Players[i].StaleUIDs[j] == uid)
                {
                    player = Players[i];
                    break;
                }
            }
            if (player != null)
            {
                break;
            }
        }
        return player;
    }
}