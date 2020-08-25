using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace FreeTabletop.Server.Models
{
    public class Room
    {
        public string RoomCode { get; set; }
        public List<Player> Players = new List<Player>();
        public List<Player> DisconnectedPlayers = new List<Player>();

        public void AddPlayer(Player player)
        {
            player.RoomCode = RoomCode;
            Players.Add(player);
        }

        public void DisconnectPlayer(string uid)
        {
            for (int i = Players.Count - 1; i >= 0; i--)
            {
                if (Players[i].UID == uid)
                {
                    DisconnectedPlayers.Add(Players[i]);
                    Players.RemoveAt(i);
                    break;
                }
            }
            if (Players.Count == 0)
            {
                GlobalData.RemoveRoom(RoomCode);
            }
        }

        public bool ReconnectPlayer(string oldUID, string newUID)
        {
            bool status = false;
            for (int i = DisconnectedPlayers.Count - 1; i >= 0; i--)
            {
                if (DisconnectedPlayers[i].UID == oldUID)
                {
                    DisconnectedPlayers[i].UID = newUID;
                    DisconnectedPlayers[i].IsConnected = true;
                    Players.Add(DisconnectedPlayers[i]);
                    DisconnectedPlayers.RemoveAt(i);
                    status = true;
                    break;
                }
            }
            return status;
        }
    }
}