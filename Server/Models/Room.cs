using System;
using System.ComponentModel.DataAnnotations;

namespace FreeTabletop.Server.Models
{
    public class Room
    {
        public string RoomCode
        {
            get => this.GenerateRoomCode();
        }

        private string GenerateRoomCode()
        {
            var rand = new Random();
            int dice = rand.Next(1, 7);
            return dice.ToString();
        }
    }
}