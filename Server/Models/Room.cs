using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace FreeTabletop.Server.Models
{
    public class Room
    {
        public string RoomCode { get; set; }
        public List<Player> Players = new List<Player>();

        public void AddPlayer(Player player)
        {
            player.RoomCode = RoomCode;
            Players.Add(player);
        }

        public void DisconnectPlayer(string uid)
        {
            bool hasOneConnection = false;
            for (int i = Players.Count - 1; i >= 0; i--)
            {
                if (Players[i].IsConnected)
                {
                    hasOneConnection = true;
                    break;
                }
            }
            if (!hasOneConnection)
            {
                GlobalData.RemoveRoom(this);
            }
        }

        public void CheckPlayerConnections()
        {
            bool hasOneConnection = false;
            for (int i = 0; i < Players.Count; i++)
            {
                if (Players[i].IsConnected)
                {
                    hasOneConnection = true;
                    break;
                }
            }
            if (!hasOneConnection)
            {
                GlobalData.RemoveRoom(this);
            }
        }
    }
}