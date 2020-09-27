using System;
using System.Collections.Generic;

namespace FreeTabletop.Shared.Models
{
    public class PlayerEntity : Entity
    {
        public bool IsConnected { get; set; } = true;
        public void UpdateUID(string newUID)
        {
            this.UID = newUID;
        }
    }
}