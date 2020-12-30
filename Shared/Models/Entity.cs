using System;
using System.Collections.Generic;

namespace FreeTabletop.Shared.Models
{
    public class Entity
    {
        public string UID { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public int[] Position { get; set; }
        public bool IsTurn { get; set; } = false;
        public int HP { get; set; }
        public int AC { get; set; }
        public bool IsAlive { get; set; }
        public bool IsBleeding {get;set;} = false;
        public bool IsBurning {get;set;} = false;
        public bool IsPoisoned {get;set;} = false;
        public bool IsConcentrating {get;set;} = false;
        public bool IsCharmed {get;set;} = false;
        public bool IsStunned {get;set;} = false;
        public bool IsRestrained {get;set;} = false;
        public bool IsUnconscious {get;set;} = false;

        public void UpdatePosition(int[] newPosition)
        {
            Position = newPosition;
        }
    }
}