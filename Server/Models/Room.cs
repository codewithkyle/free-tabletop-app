using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace FreeTabletop.Server.Models
{
    public class Room
    {
        public string RoomCode { get; set; }
        private List<Player> Players = new List<Player>();

        public void AddPlayer(Player player)
        {
            player.RoomCode = RoomCode;
            Players.Add(player);
        }

        public void RemovePlayer(Player player)
        {
            for (int i = Players.Count - 1; i >= 0; i--)
            {
                if (Players[i].UID == player.UID)
                {
                    Players.RemoveAt(i);
                    break;
                }
            }
            if (Players.Count == 0)
            {
                GlobalData.RemoveRoom(RoomCode);
            }
        }
    }
}