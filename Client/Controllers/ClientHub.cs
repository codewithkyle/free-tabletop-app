using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.SignalR.Client;
using FreeTabletop.Shared.Models;
using Microsoft.JSInterop;
using FreeTabletop.Client.Pages;
using FreeTabletop.Client.Models;

namespace FreeTabletop.Client.Controllers
{
    public class ClientHub
    {
        private NavigationManager NavigationManager { get; set; }

        private IJSRuntime JSRuntime { get; set; }

        private RoomBase Room { get; set; }

        private Tabletop Tabletop { get; set; }

        bool newConnection = false;

        string RoomCode { get; set; }

        public async Task Connect(string roomCode, RoomBase room, NavigationManager navManager, IJSRuntime jsRuntime, Tabletop tabletop)
        {
            JSRuntime = jsRuntime;
            NavigationManager = navManager;
            RoomCode = roomCode;
            Room = room;
            Tabletop = tabletop;
            bool newConnection = false;
            if (!Networker.IsConnected)
            {
                newConnection = true;
                await Networker.Connect(NavigationManager.ToAbsoluteUri("/gamehub"));
            }

            if (Networker.IsConnected)
            {
                Networker.hubConnection.On("Error:RoomNotFound", Redirect);
                Networker.hubConnection.On("Error:PlayerNotFound", Redirect);

                Networker.hubConnection.On<bool, List<PlayerEntity>>("Sync:TabletopInfo", Room.SyncTabletop);

                Networker.hubConnection.On<string>("Set:PlayerUID", UpdateUID);
                Networker.hubConnection.On<bool, string>("Set:PlayerStatus", Room.UpdatePlayerStatus);

                Networker.hubConnection.On("Player:Kick", HandleKick);

                Networker.hubConnection.On<String, bool, int[]>("Tabletop:LoadImage", Room.RenderTabletopFromImage);
                Networker.hubConnection.On("Tabletop:Clear", Room.ClearTabletop);
                Networker.hubConnection.On<List<PlayerEntity>>("Tabletop:SpawnPlayerEntities", Room.RenderPlayerEntities);
            }

            if (newConnection && Networker.IsConnected)
            {
                string uid = await JSRuntime.InvokeAsync<string>("GetPlayerUID");
                Tabletop.UID = uid;
                if (String.IsNullOrEmpty(uid))
                {
                    Redirect();
                }
                else
                {
                    await Networker.hubConnection.SendAsync("Player:Resync", RoomCode, uid);
                }
            }

            await Networker.hubConnection.SendAsync("Player:SyncTabletopInfo");
            await Networker.hubConnection.SendAsync("Player:GetStatus");
        }

        private async Task UpdateUID(string uid)
        {
            Tabletop.UID = uid;
            await JSRuntime.InvokeVoidAsync("SetPlayerUID", uid);
        }

        private async Task HandleKick()
        {
            await JSRuntime.InvokeVoidAsync("ClearStorage");
            Redirect();
        }

        private void Redirect()
        {
            NavigationManager.NavigateTo("/");
        }

        public async Task ToggleRoomLock()
        {
            await Networker.hubConnection.SendAsync("Room:ToggleLock");
        }

        public async Task KickPlayer(PlayerEntity player)
        {
            await Networker.hubConnection.SendAsync("Room:KickPlayer", player.UID);
        }

        public async Task LoadTabletop(String imageURL, bool generateGrid, int[] gridSize)
        {
            await Networker.hubConnection.SendAsync("Room:LoadImage", imageURL, generateGrid, gridSize);
        }

        public async Task ClearTabletop()
        {
            await Networker.hubConnection.SendAsync("Room:ClearTabletop");
        }
    }
}
