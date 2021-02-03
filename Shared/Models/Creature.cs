using System.Collections.Generic;
using Newtonsoft.Json;
using System;

namespace FreeTabletop.Shared.Models
{
    public class Creature : Entity
    {
        public int BaseHP { get; set; }
        public int BaseAC { get; set; }
        public string BaseName { get; set; }
        public bool IsRemoved { get; set; } = false;

        public void Main(int[] pos)
        {
            Position = pos;
        }

        public string CalculateModifier(int value)
        {
            string Modifier = "0";
            decimal Decimal = (value - 10) / 2;
            decimal newValue = Math.Floor(Decimal);

            if (newValue > 0)
            {
                Modifier = "+" + newValue.ToString();
            }
            else if (newValue < 0)
            {
                Modifier = newValue.ToString();
            }

            return Modifier;
        }
    }
}