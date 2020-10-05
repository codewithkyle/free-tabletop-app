using System.Collections.Generic;

namespace FreeTabletop.Shared.Models
{
    public class Creature : Entity
    {
        public int BaseHP { get; set; }
        public int BaseAC { get; set; }
        public string BaseName { get; set; }
        public int HP { get; set; }
        public int AC { get; set; }
        public int Strength { get; set; }
        public int Dexterity { get; set; }
        public int Intelligence { get; set; }
        public int Constitution { get; set; }
        public int Wisdom { get; set; }
        public int Charisma { get; set; }
        public List<Ability> Actions { get; set; }

        public List<Ability> Abilities { get; set; }
        public bool IsAlive = true;
        public string ActionsString { get; set; }
        public string AbilitiesString { get; set; }
    }
}