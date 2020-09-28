using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using FreeTabletop.Shared.Models;
using FreeTabletop.Client.Controllers;

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

        public String ImageURL = null;
        public bool GenerateGrid = true;

        public String TabletopImage = null;
        public bool TabletopGrid = true;
        public int TabletopX = 0;
        public int TabletopY = 0;
        public string MovingEntityUID { get; set; }

        protected override async Task OnInitializedAsync()
        {
            await Hub.Connect(RoomCode, this, NavigationManager, JSRuntime, Tabletop);
        }

        public void UpdatePlayerStatus(bool isGM, string uid)
        {
            Tabletop.IsGameMaster = isGM;
            Tabletop.UID = uid;
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
            if (ImageURL.Length != 0)
            {
                CloseAllModals();
                int[] GridSize = await JSRuntime.InvokeAsync<int[]>("GetGridSize", ImageURL);
                await Hub.LoadTabletop(ImageURL, GenerateGrid, GridSize);
                ImageURL = null;
                GenerateGrid = true;
            }
        }

        public void ToggleGridStatus()
        {
            if (GenerateGrid)
            {
                GenerateGrid = false;
            }
            else
            {
                GenerateGrid = true;
            }
            StateHasChanged();
        }

        public void RenderTabletopFromImage(String imageURL, bool generateGrid, int[] grid)
        {
            TabletopImage = imageURL;
            TabletopGrid = generateGrid;
            TabletopX = grid[0];
            TabletopY = grid[1];
            StateHasChanged();
        }

        public void ClearTabletop()
        {
            TabletopImage = null;
            TabletopGrid = true;
            StateHasChanged();
        }

        public void RenderPlayerEntities(List<PlayerEntity> players)
        {
            Tabletop.Players = players;
            Console.WriteLine("I rendered players");
            StateHasChanged();
        }

        public async Task HandleDrop(int x, int y)
        {
            int[] Position = { x, y };
            JSRuntime.InvokeVoidAsync("ClearHighlightedCells");
            await Hub.MovePlayerEntity(MovingEntityUID, Position);
        }

        public void HandleDragStart(string uid)
        {
            MovingEntityUID = uid;
        }
    }
}