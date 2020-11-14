using System;
using System.Collections.Generic;

namespace FreeTabletop.Shared.Models
{
    public class Tabletop
    {
        public string RoomCode = "";
        public bool IsGameMaster = false;
        public bool IsLocked = false;
        public List<PlayerEntity> Players = new List<PlayerEntity>();
        public List<Creature> Creatures = new List<Creature>();
        public List<NPC> NPCs = new List<NPC>();
        public List<Entity> CombatOrder = new List<Entity>();
        public string UID { get; set; }
        public string GridType = null;
        public string Image = null;
        public int[] Grid { get; set; }
        public List<Message> Messages = new List<Message>();
        public string GameMasterUID { get; set; }
        public int CellSize { get; set; }
        public int[] Size { get; set; }
        public List<Cell> Cells = new List<Cell>();

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

        public bool IsPositionValid(int[] newPosition)
        {
            bool IsValidPosition = true;
            for (int i = 0; i < Players.Count; i++)
            {
                if (Players[i].Position[0] == newPosition[0] && Players[i].Position[1] == newPosition[1])
                {
                    IsValidPosition = false;
                    break;
                }
            }
            // TODO: check NPCs
            // TOOD: check monsters
            return IsValidPosition;
        }
    }
}