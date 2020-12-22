using System;
using System.Collections.Generic;

namespace FreeTabletop.Shared.Models
{
    public class PlayerEntity : Entity
    {
        public bool IsConnected { get; set; } = true;

        public List<Message> Messages {get;set;}

        public bool UnreadMessages = false;
        public string MessageUID {get;set;}

        public void UpdateUID(string newUID)
        {
            this.UID = newUID;
        }
    }
}