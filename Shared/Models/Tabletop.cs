using System.Collections.Generic;

namespace FreeTabletop.Shared.Models
{
    public class Tabletop
    {
        public string RoomCode = "";
        public bool IsGameMaster = false;
        public bool IsLocked = false;
        public List<PlayerEntity> Players { get; set; } = new List<PlayerEntity>();
        public List<Creature> Creatures { get; set; } = new List<Creature>();

        public string UID { get; set; }

        public string GridType = "1";

        public string Image = null;
        public int[] Grid { get; set; }

        public void MoveLocalEntitiy(string uid, int[] newPosition)
        {
            for (int i = 0; i < Players.Count; i++)
            {
                if (Players[i].UID == uid)
                {
                    Players[i].Position = newPosition;
                    break;
                }
            }
        }

        public bool IsPositionValid(int[] newPosition)
        {
            bool IsValidPosition = true;
            for (int i = 0; i < Players.Count; i++)
            {
                if (Players[i].Position[0] == newPosition[0] && Players[i].Position[1] == newPosition[1])
                {
                    IsValidPosition = false;
                    break;
                }
            }
            // TODO: check NPCs
            // TOOD: check monsters
            return IsValidPosition;
        }
    }
}