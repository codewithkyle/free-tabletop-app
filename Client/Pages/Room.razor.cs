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

        protected override async Task OnInitializedAsync()
        {
            await Hub.Connect(RoomCode, this, NavigationManager, JSRuntime);
        }

        public void UpdateGameMasterStatus(bool isGM)
        {
            Tabletop.IsGameMaster = isGM;
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
                await Hub.LoadTabletop(ImageURL, GenerateGrid);
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

        public async Task RenderTabletopFromImage(String imageURL, bool generateGrid)
        {
            TabletopImage = imageURL;
            TabletopGrid = generateGrid;
            int[] GridSize = await JSRuntime.InvokeAsync<int[]>("GetGridSize", imageURL);
            TabletopX = GridSize[0];
            TabletopY = GridSize[1];
            StateHasChanged();
        }

        public void ClearTabletop()
        {
            TabletopImage = null;
            TabletopGrid = true;
            StateHasChanged();
        }
    }
}