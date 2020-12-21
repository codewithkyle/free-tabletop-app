using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using FreeTabletop.Shared.Models;
using FreeTabletop.Client.Controllers;
using Newtonsoft.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Components.Web;

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
        public bool TabletopMenuOpen = false;
        public bool ImageUploadOpen = false;
        public string InputImageURL = null;
        public string MovingEntityUID { get; set; }
        public string SelectedGridType = "1";
        public bool EntitySpawnMenuOpen = false;
        public bool MonsterLookupMenuOpen = false;
        public bool CustomCreatureMenuOpen = false;
        public bool NPCMenuOpen = false;
        public bool ChatMenuOpen = false;

        public List<string> Creatures = new List<string>();
        public string[] AllCreatures { get; set; }

        public Creature CustomCreature = new Creature();
        public NPC NewNPC = new NPC();
        public bool DidAutofocus = false;
        public double[] RightClickPosition = { -1, -1 };
        public int[] RightClickGridPosition = { 0, 0 };
        public bool DiceMenuOpen = false;
        public string ActiveDie = "d4";
        public int RollCount = 1;
        public bool CombatMenuOpen = false;
        public string ActiveChatPlayerUID = null;

        public bool HasUnreadMessages = false;

        public string SettingsMenu = null;

        public bool PlayPingSound = true;
        public bool PlayAlertSound = true;
        public bool PlayNotificationSound = true;
        public bool PlayLoadingSound = true;

        public int GridCellSize = 32;

        public bool TabletopSettingsOpen = false;

        public bool TabletopImageLoaded = false;
        public bool FogOfWar = true;
        public bool PaintMenuOpen = false;
        public enum PaintOption {
            None,
            Eraser,
            Fog,
            Highlighter
        };
        public PaintOption PaintType = PaintOption.None;
        public bool PopupImageModalOpen = false;

        protected override async Task OnInitializedAsync()
        {
            await Hub.Connect(RoomCode, this, NavigationManager, JSRuntime, Tabletop);
            PlayPingSound = await JSRuntime.InvokeAsync<bool>("GetPingSoundSetting");
            PlayAlertSound = await JSRuntime.InvokeAsync<bool>("GetAlertSoundSetting");
            PlayNotificationSound = await JSRuntime.InvokeAsync<bool>("GetNotificationSoundSetting");
            PlayLoadingSound = await JSRuntime.InvokeAsync<bool>("GetLoadingSoundSetting");
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
            if (ChatMenuOpen){
                JSRuntime.InvokeVoidAsync("ScrollChatMessages");
            }
            if (firstRender)
            {
                JSRuntime.InvokeVoidAsync("StartCombatDrag");
                JSRuntime.InvokeVoidAsync("StartChatDrag");
                JSRuntime.InvokeVoidAsync("StartDiceDrag");
                JSRuntime.InvokeVoidAsync("DragTabletop");
                JSRuntime.InvokeVoidAsync("PlaySound", "success.wav");
            }
            return base.OnAfterRenderAsync(firstRender);
        }

        public async Task UpdatePlayerStatus(bool isGM, string uid)
        {
            Tabletop.IsGameMaster = isGM;
            Tabletop.UID = uid;
            await JSRuntime.InvokeVoidAsync("SetPlayerUID", Tabletop.UID);
            if (isGM)
            {
                await JSRuntime.InvokeVoidAsync("SyncMonsterData");
            }
            StateHasChanged();
        }

        public void SyncTabletop(bool isLocked, List<PlayerEntity> players, string gmUID)
        {
            Tabletop.RoomCode = RoomCode.ToUpper();
            Tabletop.IsLocked = isLocked;
            Tabletop.Players = players;
            Tabletop.GameMasterUID = gmUID;
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
            TabletopMenuOpen = false;
            ImageUploadOpen = false;
            EntitySpawnMenuOpen = false;
            MonsterLookupMenuOpen = false;
            Creatures = new List<string>();
            CustomCreatureMenuOpen = false;
            CustomCreature = new Creature();
            NPCMenuOpen = false;
            NewNPC = new NPC();
            DidAutofocus = false;
            RightClickPosition[0] = -1;
            RightClickPosition[1] = -1;
            PopupImageModalOpen = false;
            SettingsMenu = null;
        }

        public async Task CopyRoomCodeToClipboard()
        {
            await JSRuntime.InvokeVoidAsync("CopyToClipboard", Tabletop.RoomCode);
        }

        public void ToggleTabletopMenu()
        {
            CloseAllModals();
            if (TabletopMenuOpen)
            {
                TabletopMenuOpen = false;
            }
            else
            {
                TabletopMenuOpen = true;
            }
            StateHasChanged();
        }

        public void UploadTabletopImage()
        {
            TabletopMenuOpen = false;
            ImageUploadOpen = true;
            TabletopSettingsOpen = false;
            StateHasChanged();
        }

        public async Task RemoveTabletopImage()
        {
            CloseAllModals();
            await Hub.ClearTabletop();
        }

        public async Task LoadTabletop()
        {
            if (InputImageURL.Length != 0)
            {
                if (InputImageURL == Tabletop.Image)
                {
                    await Hub.ClearTabletop();
                }
                
                CloseAllModals();
                Tabletop.Image = InputImageURL;
                TabletopImageLoaded = false;
                Tabletop.GridType = null;
                int[] GridData = await JSRuntime.InvokeAsync<int[]>("GetGridSize", InputImageURL, GridCellSize);
                await Hub.LoadTabletop(InputImageURL, SelectedGridType, GridData, GridCellSize, FogOfWar);
                FogOfWar = true;
                InputImageURL = null;
                SelectedGridType = "1";
                GridCellSize = 32;
            }
        }

        public void RenderTabletopFromImage(String imageURL, string gridType, int[] grid, int cellSize, int[] tabletopSize, List<Cell> cells)
        {
            JSRuntime.InvokeVoidAsync("LoadImage", imageURL, cellSize, tabletopSize, cells, Tabletop.IsGameMaster, gridType);
            if (Tabletop.Image != imageURL){
                Tabletop.Image = imageURL;
            }
            Tabletop.CellSize = cellSize;
            Tabletop.Size = tabletopSize;
            Tabletop.Cells = cells;
            StateHasChanged();
        }

        public void ClearTabletop()
        {
            Tabletop.Image = null;
            JSRuntime.InvokeVoidAsync("ClearImage");
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

        public async Task HandleDrop(DragEventArgs e)
        {
            int[] newPosition = await JSRuntime.InvokeAsync<int[]>("CalculateNewPawnLocation", e);
            await JSRuntime.InvokeVoidAsync("UpdateEntityPosition", MovingEntityUID, newPosition, Tabletop.CellSize);
            Hub.MoveEntity(MovingEntityUID, newPosition);
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

        public async Task OpenMonsterLookupMenu()
        {
            CloseAllModals();
            string AllCreaturesJSON = await JSRuntime.InvokeAsync<string>("GetCreatures");
            AllCreatures = JsonConvert.DeserializeObject<string[]>(AllCreaturesJSON);
            MonsterLookupMenuOpen = true;
            StateHasChanged();
        }

        public void LookupMonster(ChangeEventArgs e)
        {
            string Value = e.Value.ToString().ToLower().Trim();
            if (Value != "")
            {
                Regex expression = new Regex(Value);
                List<string> Results = new List<string>();
                for (int i = 0; i < AllCreatures.Length; i++)
                {
                    if (expression.IsMatch(AllCreatures[i]))
                    {
                        Results.Add(AllCreatures[i]);
                    }
                }
                Creatures = Results;
            }
            else
            {
                Creatures = new List<string>();
            }
            StateHasChanged();
        }

        public async Task SpawnCreature(int index)
        {
            string CreatureName = Creatures[index];
            string CreatureJSON = await JSRuntime.InvokeAsync<string>("LookupCreature", CreatureName);
            Creature Creature = JsonConvert.DeserializeObject<Creature>(CreatureJSON);
            Creature.Main(RightClickGridPosition);
            await Hub.SpawnCreature(Creature);
            await JSRuntime.InvokeVoidAsync("PlaySound", "plop.wav");
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

        public async Task SpawnCustomCreature()
        {
            if (CustomCreature.BaseName == null || CustomCreature.BaseName.Trim() == "")
            {
                await JSRuntime.InvokeVoidAsync("FocusElement", "#custom-creature-name");
            }
            else if (CustomCreature.BaseAC == 0)
            {
                await JSRuntime.InvokeVoidAsync("FocusElement", "#custom-creature-ac");
            }
            else if (CustomCreature.BaseHP == 0)
            {
                await JSRuntime.InvokeVoidAsync("FocusElement", "#custom-creature-hp");
            }
            else
            {
                CustomCreature.Position = RightClickGridPosition;
                await Hub.SpawnCreature(CustomCreature);
                await JSRuntime.InvokeVoidAsync("PlaySound", "plop.wav");
                await JSRuntime.InvokeVoidAsync("AddCustomCreature", JsonConvert.SerializeObject(CustomCreature));
                CloseAllModals();
            }
        }

        public async Task SpawnNPC()
        {
            if (NewNPC.BaseName == null || NewNPC.BaseName.Trim() == "")
            {
                await JSRuntime.InvokeVoidAsync("FocusElement", "#npc-name");
            }
            else if (NewNPC.BaseAC == 0)
            {
                await JSRuntime.InvokeVoidAsync("FocusElement", "#npc-ac");
            }
            else if (NewNPC.BaseHP == 0)
            {
                await JSRuntime.InvokeVoidAsync("FocusElement", "#npc-hp");
            }
            else
            {
                NewNPC.Position = RightClickGridPosition;
                await Hub.SpawnNPC(NewNPC);
                await JSRuntime.InvokeVoidAsync("PlaySound", "plop.wav");
                CloseAllModals();
            }
        }

        public async Task HandleRightClick(double x, double y, bool ctrlKeyPressed)
        {
            int[] cellPosition = await JSRuntime.InvokeAsync<int[]>("GetCellPosition", x, y);
            if (Tabletop.IsGameMaster && !ctrlKeyPressed)
            {
                CloseAllModals();
                RightClickPosition[0] = x;
                RightClickPosition[1] = y;
                EntitySpawnMenuOpen = true;
                RightClickGridPosition[0] = cellPosition[0];
                RightClickGridPosition[1] = cellPosition[1];
                StateHasChanged();
            }
            else if (Tabletop.IsGameMaster && ctrlKeyPressed || !Tabletop.IsGameMaster)
            {
                int[] pingPosition = await JSRuntime.InvokeAsync<int[]>("CalculateLocalPosition", x, y);
                await Hub.Ping(pingPosition[0], pingPosition[1]);
            }
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
            JSRuntime.InvokeVoidAsync("ToggleModal", "js-dice-modal", DiceMenuOpen);
        }

        public void SetActiveDie(string die)
        {
            ActiveDie = die;
            StateHasChanged();
        }

        public async Task RollDice()
        {
            CloseAllModals();
            string RollResults = await JSRuntime.InvokeAsync<string>("RollDice", RollCount.ToString() + ActiveDie);
            await JSRuntime.InvokeVoidAsync("PlaySound", "alert.wav");
            await Hub.AnnounceRoll(RollCount, ActiveDie, RollResults);
            RollCount = 1;
        }

        public void ToggleCombatMenu()
        {
            CloseAllModals();
            if (CombatMenuOpen)
            {
                CombatMenuOpen = false;
            }
            else
            {
                CombatMenuOpen = true;
            }
            JSRuntime.InvokeVoidAsync("ToggleModal", "js-combat-modal", CombatMenuOpen);
        }

        public async Task SyncCombatOrder()
        {
            await Hub.SyncCombatOrder();
        }

        public void UpdateCombatOrder(List<Entity> combatOrder)
        {
            Tabletop.CombatOrder = combatOrder;
            StateHasChanged();
        }

        public async Task UpdateEntityCombatOrderPosition(int newPosition)
        {
            await JSRuntime.InvokeVoidAsync("PlaySound", "plop.wav");
            await Hub.UpdateEntityCombatOrderPosition(MovingEntityUID, newPosition);
        }

        public async Task UpdateEntityHP(Entity entity, ChangeEventArgs e)
        {
            int HP = Int16.Parse(e.Value.ToString());
            entity.HP = HP;
            await Hub.UpdateEntityHP(entity, HP);
        }
        public async Task UpdateEntityAC(Entity entity, ChangeEventArgs e)
        {
            int AC = Int16.Parse(e.Value.ToString());
            entity.AC = AC;
            await Hub.UpdateEntityAC(entity, AC);
        }

        public void RenderPing(int x, int y)
        {
            JSRuntime.InvokeVoidAsync("Ping", x, y);
        }

        public void ToggleChatModal()
        {
            CloseAllModals();
            if (ChatMenuOpen)
            {
                ChatMenuOpen = false;
                HasUnreadMessages = false;
            }
            else
            {
                ChatMenuOpen = true;
            }
            HasUnreadMessages = false;
            JSRuntime.InvokeVoidAsync("ToggleModal", "js-chat-modal", ChatMenuOpen);
        }

        public async Task SendMessage(string Key)
        {
            if (Key == "Enter")
            {
                string Message = await JSRuntime.InvokeAsync<string>("GetChatMessage");
                await Hub.SendMessage(Message, ActiveChatPlayerUID);
                await JSRuntime.InvokeVoidAsync("ResetChatMessage");
                StateHasChanged();
            }
            else
            {
                await JSRuntime.InvokeVoidAsync("AdjustChatMessageHeight");
            }
        }

        public void UpdatesMessages(List<Message> messages)
        {
            if (messages.Count > Tabletop.Messages.Count){
                Tabletop.Messages = messages;
                if (!ChatMenuOpen)
                {
                    JSRuntime.InvokeVoidAsync("PlaySound", "message.wav");
                    HasUnreadMessages = true;
                }
                StateHasChanged();
            }
        }

        public void UpdatePlayers(List<PlayerEntity> players)
        {
            bool ContainsNewMessages = false;
            string NewActivePlayerUID = null;
            for (int i = 0; i < players.Count; i++)
            {
                for (int k = 0; k < Tabletop.Players.Count; k++)
                {
                    if (players[i].UID == Tabletop.Players[k].UID)
                    {
                        if (players[i].UID != ActiveChatPlayerUID || players[i].UID == ActiveChatPlayerUID && !ChatMenuOpen)
                        {
                            if (players[i].Messages.Count > Tabletop.Players[k].Messages.Count)
                            {
                                ContainsNewMessages = true;
                                players[i].UnreadMessages = true;
                            }
                            else if (Tabletop.Players[k].UnreadMessages)
                            {
                                players[i].UnreadMessages = true;
                            }
                        }
                        break;
                    }
                }
            }
            Tabletop.Players = players;
            if (!ChatMenuOpen && ContainsNewMessages)
            {
                JSRuntime.InvokeVoidAsync("PlaySound", "message.wav");
                HasUnreadMessages = true;
            }
            else if (ChatMenuOpen && ContainsNewMessages && NewActivePlayerUID != ActiveChatPlayerUID)
            {
                JSRuntime.InvokeVoidAsync("PlaySound", "message.wav");
            }
            StateHasChanged();
        }

        public void SetActivePlayerUID(string uid)
        {
            ActiveChatPlayerUID = uid;
            for (int k = 0; k < Tabletop.Players.Count; k++)
            {
                if (Tabletop.Players[k].UID == ActiveChatPlayerUID)
                {
                    Tabletop.Players[k].UnreadMessages = false;
                    break;
                }
            }
            StateHasChanged();
        }

        public void OpenSettingsMenu()
        {
            SettingsMenu = "settings";
            StateHasChanged();
        }

        public void TogglePingSound()
        {
            if (PlayPingSound)
            {
                PlayPingSound = false;
            }
            else
            {
                PlayPingSound = true;
            }
            JSRuntime.InvokeVoidAsync("ToggleSoundStatus", "ping", PlayPingSound);
            StateHasChanged();
        }

        public void ToggleAlertSound()
        {
            if (PlayAlertSound)
            {
                PlayAlertSound = false;
            }
            else
            {
                PlayAlertSound = true;
            }
            JSRuntime.InvokeVoidAsync("ToggleSoundStatus", "alert", PlayAlertSound);
            StateHasChanged();
        }

        public void ToggleNotificationSound()
        {
            if (PlayNotificationSound)
            {
                PlayNotificationSound = false;
            }
            else
            {
                PlayNotificationSound = true;
            }
            JSRuntime.InvokeVoidAsync("ToggleSoundStatus", "notification", PlayNotificationSound);
            StateHasChanged();
        }

        public void ToggleLoadingSound()
        {
            if (PlayLoadingSound)
            {
                PlayLoadingSound = false;
            }
            else
            {
                PlayLoadingSound = true;
            }
            JSRuntime.InvokeVoidAsync("ToggleSoundStatus", "loading", PlayLoadingSound);
            StateHasChanged();
        }

        public async Task LeaveRoom()
        {
            await Hub.Disconnect();
            NavigationManager.NavigateTo("/");
        }

        public void Reinstall()
        {
            JSRuntime.InvokeVoidAsync("Reinstall");
        }

        public void InstallPWA()
        {
            JSRuntime.InvokeVoidAsync("Install");
        }

        public async Task RemoveEntity(string uid)
        {
            await Hub.RemoveEntity(uid);
        }

        public void RenderRollNotification(int diceCount, string die, string results, string name)
        {
            JSRuntime.InvokeVoidAsync("AnnounceRoll", diceCount, die, results, name);
            JSRuntime.InvokeVoidAsync("PlaySound", "alert.wav");
        }

        public void ToggleTabletopSettings()
        {
            if (TabletopSettingsOpen)
            {
                TabletopSettingsOpen = false;
            }
            else
            {
                TabletopSettingsOpen = true;
            }
            StateHasChanged();
        }

        public void FinalizeTabletopLoading()
        {
            TabletopImageLoaded = true;
            if (Tabletop.GridType != null){
                JSRuntime.InvokeVoidAsync("PlaySound", "alert.wav");
            }
            StateHasChanged();
        }

        public void ToggleFogOfWar()
        {
            if (FogOfWar)
            {
                FogOfWar = false;
            }
            else
            {
                FogOfWar = true;
            }
        }

        public void SyncCells(int index, string style)
        {
            Tabletop.Cells[index].Style = style;
            JSRuntime.InvokeVoidAsync("SyncCell", index, style);
        }

        public void UpdateLock(bool IsLocked)
        {
            Tabletop.IsLocked = IsLocked;
            StateHasChanged();
        }

        public void TogglePaintMenu()
        {
            CloseAllModals();
            if (PaintMenuOpen)
            {
                PaintMenuOpen = false;
            }
            else
            {
                PaintMenuOpen = true;
            }
            JSRuntime.InvokeVoidAsync("ToggleModal", "js-paint-modal", PaintMenuOpen);
        }

        public async Task SetPaintType(PaintOption option)
        {
            CloseAllModals();
            PaintType = option;
            if (PaintType == PaintOption.None)
            {
                PaintMenuOpen = false;
                await JSRuntime.InvokeVoidAsync("ToggleModal", "js-paint-modal", PaintMenuOpen);
                List<Cell> cells = await JSRuntime.InvokeAsync<List<Cell>>("GetCells");
                for (int i = 0; i < cells.Count; i++)
                {
                    if (Tabletop.Cells[i].Style != cells[i].Style)
                    {
                        Tabletop.Cells[i].Style = cells[i].Style;
                        Hub.ChangeCellStyle(i, Tabletop.Cells[i].Style);
                    }
                    
                }
            }
            await JSRuntime.InvokeVoidAsync("SetPaintMode", PaintType);
        }

        public void UploadPopupImage()
        {
            CloseAllModals();
            PopupImageModalOpen = true;
            StateHasChanged();
        }

        public void LoadPopupImage()
        {
            if (InputImageURL.Length != 0){
                CloseAllModals();
                Hub.LoadPopupImage(InputImageURL);
                InputImageURL = null;
            }
        }
    }
}