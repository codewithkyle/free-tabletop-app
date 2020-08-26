using System;
using System.Collections.Generic;

namespace FreeTabletop.Shared.Models
{
    public class Entity
    {
        public string UID { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }

        // Workround since C# doesn't offer vectors
        // 0 = x
        // 1 = y
        public List<int> Position = new List<int>();
    }
}