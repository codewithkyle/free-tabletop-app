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

        public List<NPC> NPCs = new List<NPC>();

        public List<Entity> CombatOrder = new List<Entity>();

        public int CellSize = 32;

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
                    player.Messages = Players[i].Messages;
                    players.Add(player);
                }
            }
            return players;
        }

        public void LoadImage(String imageURL, string gridType, int[] gridSize, int cellSize)
        {
            ImageURL = imageURL;
            GridType = gridType;
            Grid = gridSize;
            CellSize = cellSize;
        }

        public void ClearTabletop()
        {
            ImageURL = null;
            GridType = "1";
            Creatures = new List<Creature>();
            NPCs = new List<NPC>();
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
            if (IsValidPosition)
            {
                for (int i = 0; i < Creatures.Count; i++)
                {
                    if (Creatures[i].Position[0] == newPosition[0] && Creatures[i].Position[1] == newPosition[1])
                    {
                        IsValidPosition = false;
                        break;
                    }
                }
            }
            if (IsValidPosition)
            {
                for (int i = 0; i < NPCs.Count; i++)
                {
                    if (NPCs[i].Position[0] == newPosition[0] && NPCs[i].Position[1] == newPosition[1])
                    {
                        IsValidPosition = false;
                        break;
                    }
                }
            }
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
            if (!Updated)
            {
                for (int i = 0; i < NPCs.Count; i++)
                {
                    if (NPCs[i].UID == uid)
                    {
                        Updated = true;
                        NPCs[i].UpdatePosition(newPosition);
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
            creature.IsAlive = true;
            Creatures.Add(creature);
        }

        public void SpawnNPC(NPC npc)
        {
            Guid guid = Guid.NewGuid();
            npc.Name = npc.BaseName;
            npc.Type = "friend";
            npc.UID = guid.ToString();
            npc.AC = npc.BaseAC;
            npc.HP = npc.BaseHP;
            npc.IsAlive = true;
            NPCs.Add(npc);
        }

        public List<Entity> BuildCombatOrder()
        {
            CombatOrder = new List<Entity>();

            for (int i = 0; i < Players.Count; i++)
            {
                if (!Players[i].IsGameMaster)
                {
                    CombatOrder.Add(Players[i]);
                }
            }
            for (int i = 0; i < NPCs.Count; i++)
            {
                bool IsAllowed = true;
                for (int k = 0; k < CombatOrder.Count; k++)
                {
                    if (CombatOrder[k].Name == NPCs[i].Name)
                    {
                        IsAllowed = false;
                        break;
                    }
                }
                if (IsAllowed)
                {
                    CombatOrder.Add(NPCs[i]);
                }
            }
            for (int i = 0; i < Creatures.Count; i++)
            {
                bool IsNewCreature = true;
                for (int k = 0; k < CombatOrder.Count; k++)
                {
                    if (CombatOrder[k].Name == Creatures[i].BaseName)
                    {
                        IsNewCreature = false;
                        break;
                    }
                }
                if (IsNewCreature)
                {
                    CombatOrder.Add(Creatures[i]);
                }
            }

            return CombatOrder;
        }

        public List<Entity> RemoveEntityFromCombatOrder(string uid)
        {
            for (int i = 0; i < CombatOrder.Count; i++)
            {
                if (CombatOrder[i].UID == uid)
                {
                    CombatOrder.RemoveAt(i);
                    break;
                }
            }

            return CombatOrder;
        }

        public List<Entity> UpdateCombatOrder(string uid, int newPosition)
        {
            for (int i = 0; i < CombatOrder.Count; i++)
            {
                if (CombatOrder[i].UID == uid)
                {
                    Entity Entity = CombatOrder[i];
                    CombatOrder.RemoveAt(i);
                    CombatOrder.Insert(newPosition, Entity);
                    break;
                }
            }
            return CombatOrder;
        }

        public List<Entity> UpdateCombatOrderActiveEntity(string uid)
        {
            for (int i = 0; i < CombatOrder.Count; i++)
            {
                if (CombatOrder[i].UID == uid)
                {
                    CombatOrder[i].IsTurn = true;
                }
                else
                {
                    CombatOrder[i].IsTurn = false;
                }
            }
            return CombatOrder;
        }

        public PlayerEntity GetNextActivePlayer(string uid)
        {
            PlayerEntity Player = null;
            int Index = 0;
            string NextEntityUID = null;
            for (int i = 0; i < CombatOrder.Count; i++)
            {
                if (CombatOrder[i].UID == uid)
                {
                    Index = i;
                }
            }
            Index++;
            if (Index >= CombatOrder.Count)
            {
                Index = 0;
            }
            NextEntityUID = CombatOrder[Index].UID;
            for (int i = 0; i < Players.Count; i++)
            {
                if (Players[i].UID == NextEntityUID)
                {
                    Player = Players[i];
                    break;
                }
            }
            return Player;
        }

        public string GetNextActiveEntityName(string uid)
        {
            int Index = 0;
            for (int i = 0; i < CombatOrder.Count; i++)
            {
                if (CombatOrder[i].UID == uid)
                {
                    Index = i;
                }
            }
            Index++;
            if (Index >= CombatOrder.Count)
            {
                Index = 0;
            }
            return CombatOrder[Index].Name;
        }

        public void UpdateCreatureAliveStatus(string uid, bool isAlive, int hp)
        {
            for (int i = 0; i < Creatures.Count; i++)
            {
                if (Creatures[i].UID == uid)
                {
                    Creatures[i].IsAlive = isAlive;
                    Creatures[i].HP = hp;
                    break;
                }
            }
        }

        public void UpdateEntityAC(string uid, int ac)
        {
            bool FoundEntity = false;
            for (int i = 0; i < Creatures.Count; i++)
            {
                if (Creatures[i].UID == uid)
                {
                    Creatures[i].AC = ac;
                    FoundEntity = true;
                    break;
                }
            }
            if (!FoundEntity)
            {
                for (int i = 0; i < NPCs.Count; i++)
                {
                    if (NPCs[i].UID == uid)
                    {
                        NPCs[i].AC = ac;
                        FoundEntity = true;
                        break;
                    }
                }
            }
        }

        public bool UpdateEntityHP(string uid, int hp)
        {
            bool NeedsRerender = false;
            bool FoundEntity = false;
            for (int i = 0; i < Creatures.Count; i++)
            {
                if (Creatures[i].UID == uid)
                {
                    Creatures[i].HP = hp;
                    if (Creatures[i].HP <= 0 && Creatures[i].IsAlive)
                    {
                        Creatures[i].IsAlive = false;
                        Creatures[i].HP = 0;
                        NeedsRerender = true;
                    }
                    else if (Creatures[i].HP > 0 && !Creatures[i].IsAlive)
                    {
                        Creatures[i].IsAlive = true;
                        NeedsRerender = true;
                    }
                    FoundEntity = true;
                    break;
                }
            }
            if (!FoundEntity)
            {
                for (int i = 0; i < NPCs.Count; i++)
                {
                    if (NPCs[i].UID == uid)
                    {
                        NPCs[i].HP = hp;
                        if (NPCs[i].HP <= 0 && NPCs[i].IsAlive)
                        {
                            NPCs[i].IsAlive = false;
                            NPCs[i].HP = 0;
                            NeedsRerender = true;
                        }
                        else if (NPCs[i].HP > 0 && !NPCs[i].IsAlive)
                        {
                            NPCs[i].IsAlive = true;
                            NeedsRerender = true;
                        }
                        FoundEntity = true;
                        break;
                    }
                }
            }
            return NeedsRerender;
        }

        public Player GetGameMaster()
        {
            Player GameMaster = null;
            for (int i = 0; i < Players.Count; i++)
            {
                if (Players[i].IsGameMaster)
                {
                    GameMaster = Players[i];
                    break;
                }
            }
            return GameMaster;
        }

        public List<Message> MessagePlayer(string targetPlayerUID, string msg, string author)
        {
            List<Message> messages = new List<Message>();
            for (int i = 0; i < Players.Count; i++)
            {
                if (Players[i].UID == targetPlayerUID)
                {
                    Message message = new Message();
                    message.Author = author;
                    message.Msg = msg;
                    Players[i].Messages.Add(message);
                    messages = Players[i].Messages;
                    break;
                }
            }
            return messages;
        }

        public List<Message> GetPlayerMessages(string UID)
        {
            List<Message> messages = new List<Message>();
            for (int i = 0; i < Players.Count; i++)
            {
                if (Players[i].UID == UID)
                {
                    messages = Players[i].Messages;
                    break;
                }
            }
            return messages;
        }

        public void RemoveEntity(string uid)
        {
            bool FoundEntity = false;
            for (int i = 0; i < NPCs.Count; i++)
            {
                if (NPCs[i].UID == uid)
                {
                    FoundEntity = true;
                    NPCs.RemoveAt(i);
                    break;
                }
            }
            for (int i = 0; i < Creatures.Count; i++)
            {
                if (FoundEntity)
                {
                    break;
                }
                if (Creatures[i].UID == uid)
                {
                    FoundEntity = true;
                    Creatures.RemoveAt(i);
                    break;
                }
            }
        }
    }
}