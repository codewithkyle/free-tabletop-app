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

        protected override async Task OnInitializedAsync()
        {
            if (!Networker.IsConnected)
            {
                await Networker.Connect(NavigationManager.ToAbsoluteUri("/gamehub"));
            }

            if (Networker.IsConnected)
            {
                Networker.hubConnection.On<string, string>("Load:GM", GoToRoom);
                Networker.hubConnection.On<string, string>("Load:Player", GoToRoom);

                Networker.hubConnection.On("Get:PlayerName", () =>
                {
                    view = "player";
                    StateHasChanged();
                    FocusElement("#name");
                });

                Networker.hubConnection.On("Error:RoomNotFound", () =>
                {
                    errorMessage = "Room not found";
                    room.RoomCode = "";
                    StateHasChanged();
                    FocusElement("#okay-button");
                });

                Networker.hubConnection.On("Error:RoomIsLocked", () =>
                {
                    errorMessage = "Room " + room.RoomCode.ToUpper() + " is locked";
                    StateHasChanged();
                    FocusElement("#okay-button");
                });
            }

            FocusElement("#roomCode");
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