using System;
using System.Collections.Generic;

namespace FreeTabletop.Shared.Models
{
    public class Entity
    {
        public string UID { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }

        public int[] Position { get; set; } = { 0, 0 };

        public bool IsTurn { get; set; } = false;

        public void UpdatePosition(int[] newPosition)
        {
            Position = newPosition;
        }
    }
}