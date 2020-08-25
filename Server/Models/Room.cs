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
            player.RoomCode = this.RoomCode;
            this.Players.Add(player);
        }

        public void RemovePlayer(Player player)
        {
            this.Players.Remove(player);
        }
    }
}