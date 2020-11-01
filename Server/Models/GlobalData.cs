
using System;
using FreeTabletop.Server.Models;
using System.Collections.Generic;
using FreeTabletop.Server.Controllers;
using FreeTabletop.Shared.Models;

public static class GlobalData
{
    public static List<Room> Rooms = new List<Room>();
    public static List<Player> Players = new List<Player>();

    private static List<string> UsedRoomCodes = new List<string>();

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
                ReleaseRoomCode(room.RoomCode);
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
                Players[i].Disconnect();
                if (Players[i].RoomCode != null)
                {
                    Room room = GetRoom(Players[i].RoomCode);
                    if (room != null)
                    {
                        if (!room.HasConnections())
                        {
                            RemoveRoom(room);
                        }
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

    public static string CreateRoom(string UID)
    {
        string roomCode = GenerateRoomCode();
        Player player = CreateGameMaster(UID, roomCode);
        Room room = new Room();
        room.RoomCode = roomCode;
        room.AddPlayer(player);
        Players.Add(player);
        Rooms.Add(room);
        return roomCode;
    }

    public static Player CreatePlayer(string UID, string name, string roomCode)
    {
        Player player = new Player();
        player.UID = UID;
        player.Name = name;
        player.RoomCode = roomCode;
        player.Type = "friend";
        player.Messages = new List<Message>();
        Players.Add(player);
        return player;
    }

    private static Player CreateGameMaster(string UID, string roomCode)
    {
        Player player = new Player();
        player.Name = "GM";
        player.UID = UID;
        player.RoomCode = roomCode;
        player.IsGameMaster = true;
        return player;
    }

    private static string GenerateRoomCode()
    {
        string abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        Random random = new Random();
        bool isUnique = false;
        string roomCode = "";
        while (!isUnique)
        {
            roomCode = "";
            for (int i = 0; i < 6; i++)
            {
                int index = random.Next(abc.Length);
                roomCode += abc[index];
            }

            bool generatedRoomCodeIsUnique = true;
            for (int i = 0; i < UsedRoomCodes.Count; i++)
            {
                if (roomCode == UsedRoomCodes[i])
                {
                    generatedRoomCodeIsUnique = false;
                }
            }
            if (generatedRoomCodeIsUnique)
            {
                isUnique = true;
                UsedRoomCodes.Add(roomCode);
            }
        }
        return roomCode;
    }

    private static void ReleaseRoomCode(string roomCode)
    {
        for (int i = UsedRoomCodes.Count - 1; i >= 0; i--)
        {
            if (UsedRoomCodes[i] == roomCode)
            {
                UsedRoomCodes.RemoveAt(i);
                break;
            }
        }
    }
}