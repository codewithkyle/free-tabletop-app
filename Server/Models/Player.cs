using System.Collections.Generic;
using FreeTabletop.Shared.Models;

namespace FreeTabletop.Server.Models
{
    public class Player : PlayerEntity
    {
        public string RoomCode { get; set; }
        public bool IsGameMaster {get; set;}

        public List<string> StaleUIDs = new List<string>();

        public int Heartbeat = 0;

        public void Reconnect(string newUID)
        {
            IsConnected = true;
            UID = newUID;
            StaleUIDs.Add(UID);
        }

        public void Disconnect()
        {
            IsConnected = false;
        }
    }
}