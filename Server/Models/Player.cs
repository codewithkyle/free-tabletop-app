using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace FreeTabletop.Server.Models
{
    public class Player
    {
        public string Name { get; set; }
        public string RoomCode { get; set; }
        public string UID { get; set; }
        public bool IsConnected { get; set; }
        public bool IsGameMaster { get; set; }

        public List<string> StaleUIDs = new List<string>();
    }
}