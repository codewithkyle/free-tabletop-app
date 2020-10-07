using System.Collections.Generic;
using Newtonsoft.Json;

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
        public bool IsAlive { get; set; }
        public string ActionsString { get; set; }
        public string AbilitiesString { get; set; }
        public int View = 1;

        public void Main(int[] pos)
        {
            Position = pos;
            Abilities = JsonConvert.DeserializeObject<List<Ability>>(AbilitiesString);
            Actions = JsonConvert.DeserializeObject<List<Ability>>(ActionsString);
        }
    }
}