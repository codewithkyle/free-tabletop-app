namespace FreeTabletop.Shared.Models
{
    public class NPC : Entity
    {
        public int BaseHP { get; set; }
        public int BaseAC { get; set; }
        public string BaseName { get; set; }
        public int HP { get; set; }
        public int AC { get; set; }
    }
}