using System;
using System.ComponentModel.DataAnnotations;

namespace FreeTabletop.Server.Models
{
    public class Player
    {
        public string Name { get; set; }
        public string RoomCode { get; set; }
        public string UID { get; set; }
    }
}