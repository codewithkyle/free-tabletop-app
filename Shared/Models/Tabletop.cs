using System;
using System.Collections.Generic;

namespace FreeTabletop.Shared.Models
{
    public class Tabletop
    {
        public string RoomCode = "";
        public bool IsGameMaster = false;
        public bool IsLocked = false;
        public List<PlayerEntity> Players { get; set; } = new List<PlayerEntity>();

        public string UID { get; set; }

        public void MoveLocalEntitiy(string uid, int[] newPosition)
        {
            for (int i = 0; i < Players.Count; i++)
            {
                if (Players[i].UID == uid)
                {
                    Players[i].Position = newPosition;
                    break;
                }
            }
        }
    }
}