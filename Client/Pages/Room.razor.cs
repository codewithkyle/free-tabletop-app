using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using FreeTabletop.Shared.Models;
using FreeTabletop.Client.Controllers;
using Newtonsoft.Json;

namespace FreeTabletop.Client.Pages
{
    public class RoomBase : ComponentBase
    {
        [Parameter]
        public string RoomCode { get; set; }

        [Inject]
        private NavigationManager NavigationManager { get; set; }

        [Inject]
        private IJSRuntime JSRuntime { get; set; }

        public Tabletop Tabletop = new Tabletop();

        public ClientHub Hub = new ClientHub();

        public bool InfoMenuOpen = false;
        public bool SettingsMenuOpen = false;
        public bool ImageUploadOpen = false;
        public string InputImageURL = null;
        public string MovingEntityUID { get; set; }
        public string SelectedGridType = "1";
        public bool EntitySpawnMenuOpen = false;
        public bool MonsterLookupMenuOpen = false;
        public bool CustomCreatureMenuOpen = false;
        public bool NPCMenuOpen = false;

        public List<Creature> Creatures = new List<Creature>();

        public Creature CustomCreature = new Creature();
        public NPC NewNPC = new NPC();
        public bool DidAutofocus = false;
        public double[] RightClickPosition = { -1, -1 };
        public int[] RightClickGridPosition = { 0, 0 };
        public bool DiceMenuOpen = false;
        public string ActiveDie = "d4";
        public int RollCount = 1;
        public bool CombatMenuOpen = false;

        protected override async Task OnInitializedAsync()
        {
            await Hub.Connect(RoomCode, this, NavigationManager, JSRuntime, Tabletop);
        }

        protected override Task OnAfterRenderAsync(bool firstRender)
        {
            if (!DidAutofocus)
            {
                if (MonsterLookupMenuOpen)
                {
                    JSRuntime.InvokeVoidAsync("FocusElement", ".js-monster-lookup");
                    DidAutofocus = true;
                }
                else if (ImageUploadOpen)
                {
                    JSRuntime.InvokeVoidAsync("FocusElement", ".js-image-input");
                    DidAutofocus = true;
                }
                else if (NPCMenuOpen)
                {
                    JSRuntime.InvokeVoidAsync("FocusElement", ".js-npc-input");
                    DidAutofocus = true;
                }
            }
            return base.OnAfterRenderAsync(firstRender);
        }

        public void UpdatePlayerStatus(bool isGM, string uid)
        {
            Tabletop.IsGameMaster = isGM;
            Tabletop.UID = uid;
            if (isGM)
            {
                JSRuntime.InvokeVoidAsync("SyncMonsterData");
            }
            Console.WriteLine(Tabletop.IsGameMaster);
            StateHasChanged();
        }

        public void SyncTabletop(bool isLocked, List<PlayerEntity> players)
        {
            Tabletop.RoomCode = RoomCode.ToUpper();
            Tabletop.IsLocked = isLocked;
            Tabletop.Players = players;
            StateHasChanged();
        }

        public void ToggleInfoMenu()
        {
            CloseAllModals();
            if (InfoMenuOpen)
            {
                InfoMenuOpen = false;
            }
            else
            {
                InfoMenuOpen = true;
            }
            StateHasChanged();
        }

        public void CloseAllModals()
        {
            InfoMenuOpen = false;
            SettingsMenuOpen = false;
            ImageUploadOpen = false;
            EntitySpawnMenuOpen = false;
            MonsterLookupMenuOpen = false;
            Creatures = new List<Creature>();
            CustomCreatureMenuOpen = false;
            CustomCreature = new Creature();
            NPCMenuOpen = false;
            NewNPC = new NPC();
            DidAutofocus = false;
            RightClickPosition[0] = -1;
            RightClickPosition[1] = -1;
            DiceMenuOpen = false;
            CombatMenuOpen = false;
            StateHasChanged();
        }

        public async Task CopyRoomCodeToClipboard()
        {
            await JSRuntime.InvokeVoidAsync("CopyToClipboard", Tabletop.RoomCode);
        }

        public void ToggleSettingsMenu()
        {
            CloseAllModals();
            if (SettingsMenuOpen)
            {
                SettingsMenuOpen = false;
            }
            else
            {
                SettingsMenuOpen = true;
            }
            StateHasChanged();
        }

        public void UploadTabletopImage()
        {
            SettingsMenuOpen = false;
            ImageUploadOpen = true;
            StateHasChanged();
        }

        public void RemoveTabletopImage()
        {
            CloseAllModals();
            Hub.ClearTabletop();
        }

        public async Task LoadTabletop()
        {
            if (InputImageURL.Length != 0)
            {
                CloseAllModals();
                int[] GridSize = await JSRuntime.InvokeAsync<int[]>("GetGridSize", InputImageURL);
                await Hub.LoadTabletop(InputImageURL, SelectedGridType, GridSize);
                InputImageURL = null;
                SelectedGridType = "1";
            }
        }

        public void RenderTabletopFromImage(String imageURL, string gridType, int[] grid)
        {
            Tabletop.Image = imageURL;
            Tabletop.GridType = gridType;
            Tabletop.Grid = grid;
            StateHasChanged();
        }

        public void ClearTabletop()
        {
            Tabletop.Image = null;
            Tabletop.Players = new List<PlayerEntity>();
            StateHasChanged();
        }

        public void RenderPlayerEntities(List<PlayerEntity> players)
        {
            Tabletop.Players = players;
            StateHasChanged();
        }

        public void RenderCreatureEntities(List<Creature> creatures)
        {
            Tabletop.Creatures = creatures;
            StateHasChanged();
        }

        public void RenderNPCEntities(List<NPC> npcs)
        {
            Tabletop.NPCs = npcs;
            StateHasChanged();
        }

        public async Task HandleDrop(int x, int y)
        {
            int[] Position = { x, y };
            await JSRuntime.InvokeVoidAsync("ClearHighlightedCells");
            await Hub.MoveEntity(MovingEntityUID, Position);
        }

        public void HandleDragStart(string uid)
        {
            MovingEntityUID = uid;
        }

        public void ToggleEntitySpawnMenu()
        {
            CloseAllModals();
            if (EntitySpawnMenuOpen)
            {
                EntitySpawnMenuOpen = false;
            }
            else
            {
                RightClickGridPosition[0] = 0;
                RightClickGridPosition[1] = 0;
                EntitySpawnMenuOpen = true;
            }
            StateHasChanged();
        }

        public void OpenMonsterLookupMenu()
        {
            CloseAllModals();
            MonsterLookupMenuOpen = true;
            StateHasChanged();
        }

        public async Task LookupMonster(ChangeEventArgs e)
        {
            string Value = e.Value.ToString().ToLower();
            if (Value != "")
            {
                string CreatureJSON = await JSRuntime.InvokeAsync<string>("LookupCreature", Value);
                Creatures = JsonConvert.DeserializeObject<List<Creature>>(CreatureJSON);
            }
            else
            {
                Creatures = new List<Creature>();
            }
            StateHasChanged();
        }

        public void SpawnCreature(int index)
        {
            Creature Creature = Creatures[index];
            Creature.Position = RightClickGridPosition;
            Hub.SpawnCreature(Creature);
            CloseAllModals();
        }

        public void OpenCustomCreatureMenu()
        {
            CloseAllModals();
            CustomCreatureMenuOpen = true;
            StateHasChanged();
        }

        public void OpenNPCMenu()
        {
            CloseAllModals();
            NPCMenuOpen = true;
            StateHasChanged();
        }

        public void SpawnCustomCreature()
        {
            if (CustomCreature.BaseName == null || CustomCreature.BaseName.Trim() == "")
            {
                JSRuntime.InvokeVoidAsync("FocusElement", "#custom-creature-name");
            }
            else if (CustomCreature.BaseAC == 0)
            {
                JSRuntime.InvokeVoidAsync("FocusElement", "#custom-creature-ac");
            }
            else if (CustomCreature.BaseHP == 0)
            {
                JSRuntime.InvokeVoidAsync("FocusElement", "#custom-creature-hp");
            }
            else
            {
                CustomCreature.Position = RightClickGridPosition;
                Hub.SpawnCreature(CustomCreature);
                JSRuntime.InvokeVoidAsync("AddCustomCreature", JsonConvert.SerializeObject(CustomCreature));
                CloseAllModals();
            }
        }

        public void SpawnNPC()
        {
            if (NewNPC.BaseName == null || NewNPC.BaseName.Trim() == "")
            {
                JSRuntime.InvokeVoidAsync("FocusElement", "#npc-name");
            }
            else if (NewNPC.BaseAC == 0)
            {
                JSRuntime.InvokeVoidAsync("FocusElement", "#npc-ac");
            }
            else if (NewNPC.BaseHP == 0)
            {
                JSRuntime.InvokeVoidAsync("FocusElement", "#npc-hp");
            }
            else
            {
                NewNPC.Position = RightClickGridPosition;
                Hub.SpawnNPC(NewNPC);
                CloseAllModals();
            }
        }

        public void HandleRightClick(double x, double y, int gridX, int gridY)
        {
            CloseAllModals();
            RightClickPosition[0] = x;
            RightClickPosition[1] = y;
            EntitySpawnMenuOpen = true;
            RightClickGridPosition[0] = gridX;
            RightClickGridPosition[1] = gridY;
            StateHasChanged();
        }

        public void ToggleDiceMenu()
        {
            CloseAllModals();
            if (DiceMenuOpen)
            {
                DiceMenuOpen = false;
            }
            else
            {
                DiceMenuOpen = true;
            }
            StateHasChanged();
        }

        public void SetActiveDie(string die)
        {
            ActiveDie = die;
            StateHasChanged();
        }

        public void RollDice()
        {
            CloseAllModals();
            JSRuntime.InvokeVoidAsync("RollDice", RollCount.ToString() + ActiveDie);
            RollCount = 1;
        }

        public void ToggleCombatMenu()
        {
            CloseAllModals();
            CombatMenuOpen = true;
            StateHasChanged();
        }

        public void SyncCombatOrder()
        {
            Hub.SyncCombatOrder();
        }

        public void UpdateCombatOrder(List<Entity> combarOrder)
        {
            Tabletop.CombatOrder = combarOrder;
            StateHasChanged();
        }

        public void UpdateEntityCombatOrderPosition(int newPosition)
        {
            Hub.UpdateEntityCombatOrderPosition(MovingEntityUID, newPosition);
        }
    }
}