using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.JSInterop;
using FreeTabletop.Shared.Models;

namespace FreeTabletop.Client
{
    public partial class RoomBase : ComponentBase
    {
        [Parameter]
        public string RoomCode { get; set; }

        [Inject]
        private NavigationManager NavigationManager { get; set; }

        [Inject]
        private IJSRuntime JSRuntime { get; set; }

        public Tabletop Tabletop = new Tabletop();

        public bool InfoMenuOpen = false;

        protected override async Task OnInitializedAsync()
        {
            bool newConnection = false;
            if (!Networker.IsConnected)
            {
                newConnection = true;
                await Networker.Connect(NavigationManager.ToAbsoluteUri("/gamehub"));
            }

            // Connected to server, register incoming message handler functions
            if (Networker.IsConnected)
            {
                Console.WriteLine("Connected");
                Networker.hubConnection.On("Error:RoomNotFound", Redirect);
                Networker.hubConnection.On("Error:PlayerNotFound", Redirect);

                Networker.hubConnection.On<bool, List<PlayerEntity>>("Sync:TabletopInfo", SyncTabletop);

                Networker.hubConnection.On<string>("Set:PlayerUID", UpdateUID);
                Networker.hubConnection.On<bool>("Set:IsGameMaster", UpdateGameMasterStatus);

                Networker.hubConnection.On("Player:Kick", HandleKick);
            }

            if (newConnection && Networker.IsConnected)
            {
                string uid = await JSRuntime.InvokeAsync<string>("GetPlayerUID");
                if (String.IsNullOrEmpty(uid))
                {
                    Redirect();
                }
                else
                {
                    await Networker.hubConnection.SendAsync("Player:Resync", RoomCode, uid);
                }
            }

            Console.WriteLine("Requesting tabletop sync");
            await Networker.hubConnection.SendAsync("Player:SyncTabletopInfo");
            await Networker.hubConnection.SendAsync("Player:IsGameMaster");
        }

        private async Task HandleKick()
        {
            await JSRuntime.InvokeVoidAsync("ClearStorage");
            Redirect();
        }

        private void UpdateGameMasterStatus(bool isGM)
        {
            Tabletop.IsGameMaster = isGM;
            StateHasChanged();
        }

        private void SyncTabletop(bool isLocked, List<PlayerEntity> players)
        {
            Console.WriteLine("Tabletop synced");
            Tabletop.RoomCode = RoomCode.ToUpper();
            Tabletop.IsLocked = isLocked;
            Tabletop.Players = players;
            StateHasChanged();
        }

        private async Task UpdateUID(string uid)
        {
            await JSRuntime.InvokeVoidAsync("SetPlayerUID", uid);
        }

        private void Redirect()
        {
            NavigationManager.NavigateTo("/");
        }

        public void ToggleInfoMenu()
        {
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
            StateHasChanged();
        }

        public async Task CopyRoomCodeToClipboard()
        {
            await JSRuntime.InvokeVoidAsync("CopyToClipboard", Tabletop.RoomCode);
        }

        public async Task ToggleRoomLock()
        {
            await Networker.hubConnection.SendAsync("Room:ToggleLock");
        }

        public async Task KickPlayer(int index)
        {
            PlayerEntity player = Tabletop.Players[index];
            await Networker.hubConnection.SendAsync("Room:KickPlayer", player.UID);
        }
    }
}