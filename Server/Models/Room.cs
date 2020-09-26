using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System.Threading.Tasks;
using FreeTabletop.Shared.Models;

namespace FreeTabletop.Server.Models
{
    public class Room
    {
        public string RoomCode { get; set; }
        public List<Player> Players = new List<Player>();
        public bool IsLocked = false;

        public String ImageURL;
        public bool GenerateGrid = true;

        public void AddPlayer(Player player)
        {
            player.RoomCode = RoomCode;
            Players.Add(player);
        }

        public void DisconnectPlayer(string uid)
        {
            bool hasOneConnection = false;
            for (int i = Players.Count - 1; i >= 0; i--)
            {
                if (Players[i].IsConnected)
                {
                    hasOneConnection = true;
                    break;
                }
            }
            if (!hasOneConnection)
            {
                GlobalData.RemoveRoom(this);
            }
        }

        public bool HasConnections()
        {
            bool hasOneConnection = false;
            for (int i = 0; i < Players.Count; i++)
            {
                if (Players[i].IsConnected)
                {
                    hasOneConnection = true;
                    break;
                }
            }
            return hasOneConnection;
        }

        public void ToggleLock()
        {
            if (IsLocked)
            {
                IsLocked = false;
            }
            else
            {
                IsLocked = true;
            }
        }

        public void KickPlayer(Player player)
        {
            for (int i = Players.Count - 1; i >= 0; i--)
            {
                if (Players[i].UID == player.UID)
                {
                    Players[i].RoomCode = null;
                    Players.RemoveAt(i);
                    break;
                }
            }
        }

        public List<PlayerEntity> BuildPlayerEntities()
        {
            List<PlayerEntity> players = new List<PlayerEntity>();
            for (int i = 0; i < Players.Count; i++)
            {
                if (!Players[i].IsGameMaster)
                {
                    PlayerEntity player = new PlayerEntity();
                    player.UID = Players[i].UID;
                    player.Name = Players[i].Name;
                    player.Type = "player";
                    player.IsConnected = Players[i].IsConnected;
                    players.Add(player);
                }
            }
            return players;
        }

        public void LoadImage(String imageURL, bool generateGrid)
        {
            ImageURL = imageURL;
            GenerateGrid = generateGrid;
        }

        public void ClearTabletop()
        {
            ImageURL = null;
            GenerateGrid = true;
        }
    }
}