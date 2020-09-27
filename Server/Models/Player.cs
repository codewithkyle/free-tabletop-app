using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using FreeTabletop.Shared.Models;

namespace FreeTabletop.Server.Models
{
    public class Player : PlayerEntity
    {
        public string RoomCode { get; set; }
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