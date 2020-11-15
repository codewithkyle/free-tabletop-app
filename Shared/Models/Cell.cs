using System;
using System.Collections.Generic;

namespace FreeTabletop.Shared.Models
{
    public class Cell
    {
        public int[] Position { get; set; } = {0, 0};

        public bool IsBlackout {get; set;}
    }
}