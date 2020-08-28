using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace FreeTabletop.Server.Models
{
    public class Player
    {
        public string Name { get; set; }
        public string RoomCode { get; set; }
        public string UID { get; set; }
        public bool IsConnected = true;
        public bool IsGameMaster = false;

        public List<string> StaleUIDs = new List<string>();

        public void Reconnect(string newUID)
        {
            IsConnected = true;
            UID = newUID;
        }

        public void Disconnect()
        {
            IsConnected = false;
            StaleUIDs.Add(UID);
        }
    }
}