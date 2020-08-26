using System;
using System.Collections.Generic;

namespace FreeTabletop.Shared.Models
{
    public class Tabletop
    {
        public string RoomCode { get; set; }

        public bool IsGameMaster { get; set; }

        public bool IsLocked { get; set; }

        public List<PlayerEntity> Players { get; set; }
    }
}