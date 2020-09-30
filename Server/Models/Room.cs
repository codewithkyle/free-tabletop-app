using System;
using System.Collections.Generic;
using FreeTabletop.Shared.Models;

namespace FreeTabletop.Server.Models
{
    public class Room
    {
        public string RoomCode { get; set; }
        public List<Player> Players = new List<Player>();
        public bool IsLocked = false;

        public String ImageURL;
        public string GridType = "1";

        public int[] Grid = { 0, 0 };

        public List<Creature> Creatures = new List<Creature>();

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
                    player.Type = "friend";
                    player.IsConnected = Players[i].IsConnected;
                    player.Position = Players[i].Position;
                    players.Add(player);
                }
            }
            return players;
        }

        public void LoadImage(String imageURL, string gridType, int[] gridSize)
        {
            ImageURL = imageURL;
            GridType = gridType;
            Grid = gridSize;
        }

        public void ClearTabletop()
        {
            ImageURL = null;
            GridType = "1";
            Creatures = new List<Creature>();
        }

        public void ResetPlayerPawnPositions()
        {
            int X = Convert.ToInt32(Math.Round((double)(Grid[0] / 2)));
            int Y = Convert.ToInt32(Math.Round((double)(Grid[1] / 2)));
            int StartingX = X;

            for (int i = 0; i < Players.Count; i++)
            {
                if (!Players[i].IsGameMaster)
                {
                    Players[i].Position[0] = X;
                    Players[i].Position[1] = Y;
                    X++;
                    if (X > Grid[0])
                    {
                        X = StartingX;
                        Y++;
                    }
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

        public void UpdateEntityPosition(string uid, int[] newPosition)
        {
            bool Updated = false;
            for (int i = 0; i < Players.Count; i++)
            {
                if (Players[i].UID == uid)
                {
                    Updated = true;
                    Players[i].UpdatePosition(newPosition);
                    break;
                }
            }
            if (!Updated)
            {
                for (int i = 0; i < Creatures.Count; i++)
                {
                    if (Creatures[i].UID == uid)
                    {
                        Updated = true;
                        Creatures[i].UpdatePosition(newPosition);
                        break;
                    }
                }
            }
        }

        public void SpawnCreature(Creature creature)
        {
            Guid guid = Guid.NewGuid();
            creature.Name = creature.BaseName;
            creature.Type = "foe";
            creature.UID = guid.ToString();
            creature.AC = creature.BaseAC;
            creature.HP = creature.BaseHP;
            Creatures.Add(creature);
        }
    }
}