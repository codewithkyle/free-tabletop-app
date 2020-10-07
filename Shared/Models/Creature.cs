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
        public int Strength { get; set; }
        public int Dexterity { get; set; }
        public int Intelligence { get; set; }
        public int Constitution { get; set; }
        public int Wisdom { get; set; }
        public int Charisma { get; set; }
        public List<Ability> Actions { get; set; }
        public List<Ability> Abilities { get; set; }
        public string ActionsString { get; set; }
        public string AbilitiesString { get; set; }
        public int View = 1;

        public void Main(int[] pos)
        {
            Position = pos;
            Abilities = JsonConvert.DeserializeObject<List<Ability>>(AbilitiesString);
            Actions = JsonConvert.DeserializeObject<List<Ability>>(ActionsString);
        }

        public void SetView(int view)
        {
            View = view;
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