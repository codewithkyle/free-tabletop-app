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
        public string MessageUID {get; set;}
    }
}