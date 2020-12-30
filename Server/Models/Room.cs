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
        public int[] TabletopSize = {0, 0};

        public List<Creature> Creatures = new List<Creature>();

        public List<NPC> NPCs = new List<NPC>();

        public List<Entity> CombatOrder = new List<Entity>();

        public int CellSize = 32;

        public bool FogOfWar = true;

        public List<Cell> Cells = new List<Cell>();

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
                    player.Position = Players[i].Position;
                    player.MessageUID = Players[i].MessageUID;
                    player.IsBleeding = Players[i].IsBleeding;
                    player.IsBurning = Players[i].IsBurning;
                    player.IsPoisoned = Players[i].IsPoisoned;
                    player.IsConcentrating = Players[i].IsConcentrating;
                    players.Add(player);
                }
            }
            return players;
        }

        public void LoadImage(String imageURL, string gridType, int[] gridSize, int cellSize, int[] tabletopSize, bool fogOfWar)
        {
            ImageURL = imageURL;
            GridType = gridType;
            Grid = gridSize;
            CellSize = cellSize;
            TabletopSize = tabletopSize;
            FogOfWar = fogOfWar;

            Cells = new List<Cell>();
            for (int y = 0; y < Grid[1]; y++)
            {
                for (int x = 0; x < Grid[0]; x++)
                {
                    Cell Cell = new Cell();
                    int[] Position = {x, y};
                    Cell.Position = Position;
                    if (FogOfWar)
                    {
                        Cell.Style = "fog";
                    }
                    else
                    {
                        Cell.Style = "clear";
                    }
                    Cells.Add(Cell);
                }
            }
        }

        public void ClearTabletop()
        {
            ImageURL = null;
            GridType = "1";
            Creatures = new List<Creature>();
            NPCs = new List<NPC>();
            Cells = new List<Cell>();
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
                    int[] Position = {X, Y};
                    Players[i].UpdatePosition(Position);
                    X++;
                    if (X > Grid[0])
                    {
                        X = StartingX;
                        Y++;
                    }
                }
            }
        }

        public void UpdateEntityPosition(string uid, int[] newPosition)
        {
            Entity EntityToMove = GetEntity(uid);
            if (EntityToMove != null)
            {
                EntityToMove.UpdatePosition(newPosition);
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
            List<Entity> NewCombatOrder = new List<Entity>();

            for (int i = 0; i < Players.Count; i++)
            {
                if (!Players[i].IsGameMaster)
                {
                    NewCombatOrder.Add(Players[i]);
                }
            }
            for (int i = 0; i < NPCs.Count; i++)
            {
                bool IsAllowed = true;
                for (int k = 0; k < NewCombatOrder.Count; k++)
                {
                    if (NewCombatOrder[k].Name == NPCs[i].Name)
                    {
                        IsAllowed = false;
                        break;
                    }
                }
                if (IsAllowed)
                {
                    NewCombatOrder.Add(NPCs[i]);
                }
            }
            for (int i = 0; i < Creatures.Count; i++)
            {
                bool IsNewCreature = true;
                for (int k = 0; k < NewCombatOrder.Count; k++)
                {
                    if (NewCombatOrder[k].Name == Creatures[i].BaseName)
                    {
                        IsNewCreature = false;
                        break;
                    }
                }
                if (IsNewCreature)
                {
                    NewCombatOrder.Add(Creatures[i]);
                }
            }

            for (int i = 0; i < NewCombatOrder.Count; i++)
            {
                bool IsNew = true;
                for (int k = 0; k < CombatOrder.Count; k++)
                {
                    if (CombatOrder[k].Name == NewCombatOrder[i].Name)
                    {
                        IsNew = false;
                        break;
                    }
                }
                if (IsNew)
                {
                    CombatOrder.Add(NewCombatOrder[i]);
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
                    NPCs[i].IsRemoved = true;
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
                    Creatures[i].IsRemoved = true;
                    break;
                }
            }
        }

        public void UpdateCellStyle(int index, string style)
        {
            Cells[index].Style = style;
        }

        private Entity GetEntity(string uid)
        {
            Entity entity = null;
            for (int i = 0; i < NPCs.Count; i++)
            {
                if (NPCs[i].UID == uid)
                {
                    entity = NPCs[i];
                    break;
                }
            }
            for (int i = 0; i < Creatures.Count; i++)
            {
                if (entity != null)
                {
                    break;
                }
                if (Creatures[i].UID == uid)
                {
                    entity = Creatures[i];
                    break;
                }
            }
            for (int i = 0; i < Players.Count; i++)
            {
                if (entity != null)
                {
                    break;
                }
                if (Players[i].UID == uid)
                {
                    entity = Players[i];
                    break;
                }
            }
            return entity;
        }

        public void SetBleeding(string uid, bool isBleeding)
        {
            Entity entity = GetEntity(uid);
            if (entity != null)
            {
                entity.IsBleeding = isBleeding;
            }
        }

        public void SetBurning(string uid, bool isBurning)
        {
            Entity entity = GetEntity(uid);
            if (entity != null)
            {
                entity.IsBurning = isBurning;
            }
        }

        public void SetPoison(string uid, bool isPoisoned)
        {
            Entity entity = GetEntity(uid);
            if (entity != null)
            {
                entity.IsPoisoned = isPoisoned;
            }
        }

        public void SetConcentration(string uid, bool isConcentrating)
        {
            Entity entity = GetEntity(uid);
            if (entity != null)
            {
                entity.IsConcentrating = isConcentrating;
            }
        }
    }
}