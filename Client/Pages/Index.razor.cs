using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.JSInterop;
using FreeTabletop.Client.Models;

namespace FreeTabletop.Client.Pages
{
    public class IndexBase : ComponentBase
    {

        [Inject]
        private NavigationManager NavigationManager { get; set; }

        [Inject]
        private IJSRuntime JSRuntime { get; set; }

        public JoinRoomForm room = new JoinRoomForm();
        public NewPlayerForm player = new NewPlayerForm();

        public string errorMessage = null;
        public string view = "initial";

        protected override Task OnAfterRenderAsync(bool firstRender)
        {
            if (firstRender)
            {
                JSRuntime.InvokeVoidAsync("PlaySound", "celebration.wav");
            }
            return base.OnAfterRenderAsync(firstRender);
        }

        protected override async Task OnInitializedAsync()
        {
            bool IsNewConnection = false;
            if (!Networker.IsConnected)
            {
                IsNewConnection = true;
                await Networker.Connect(NavigationManager.ToAbsoluteUri("/gamehub"));
            }

            if (Networker.IsConnected)
            {
                if (!IsNewConnection)
                {
                    MessageReset();
                }
                Networker.hubConnection.On<string, string>("Load:GM", GoToRoom);
                Networker.hubConnection.On<string, string>("Load:Player", GoToRoom);

                Networker.hubConnection.On("Get:PlayerName", async () =>
                {
                    view = "player";
                    StateHasChanged();
                    await FocusElement("#name");
                });

                Networker.hubConnection.On("Error:RoomNotFound", async () =>
                {
                    errorMessage = "Room not found";
                    room.RoomCode = "";
                    StateHasChanged();
                    await FocusElement("#okay-button");
                });

                Networker.hubConnection.On("Error:RoomIsLocked", async () =>
                {
                    errorMessage = "Room " + room.RoomCode.ToUpper() + " is locked";
                    StateHasChanged();
                    await FocusElement("#okay-button");
                });
            }

            await FocusElement("#roomCode");
        }

        private void MessageReset()
        {
            Networker.hubConnection.Remove("Load:GM");
            Networker.hubConnection.Remove("Load:Player");
            Networker.hubConnection.Remove("Get:PlayerName");
            Networker.hubConnection.Remove("Error:RoomNotFound");
            Networker.hubConnection.Remove("Error:RoomIsLocked");
        }

        private async Task FocusElement(string selector)
        {
            await JSRuntime.InvokeVoidAsync("FocusElement", selector);
        }

        private async Task GoToRoom(string roomCode, string uid)
        {
            await JSRuntime.InvokeVoidAsync("SetPlayerUID", uid);
            NavigationManager.NavigateTo("room/" + roomCode.ToLower());
        }

        public async Task HandleSubmitName()
        {
            await Networker.hubConnection.SendAsync("Player:JoinRoom", room.RoomCode, player.Name);
        }

        public async Task HandleCreateRoom()
        {
            await Networker.hubConnection.SendAsync("Create:Room");
        }

        public async Task HandleSubmitRoomCode()
        {
            string savedUID = await JSRuntime.InvokeAsync<string>("GetPlayerUID");
            await Networker.hubConnection.SendAsync("Player:LookupRoom", room.RoomCode, savedUID);
        }

        public void ClearMessage()
        {
            errorMessage = null;
            StateHasChanged();
        }
    }
}