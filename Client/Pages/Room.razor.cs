using System;
using Microsoft.AspNetCore.Components;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.JSInterop;

namespace FreeTabletop.Client
{
    public partial class RoomBase : ComponentBase
    {
        [Parameter]
        public string roomCode { get; set; }

        [Inject]
        private NavigationManager NavigationManager { get; set; }

        [Inject]
        private IJSRuntime JSRuntime { get; set; }

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
                Networker.hubConnection.On("Error:RoomNotFound", Redirect);
                Networker.hubConnection.On("Error:PlayerNotFound", Redirect);

                Networker.hubConnection.On<string>("Sync:PlayerUID", UpdateUID);
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
                    await Networker.hubConnection.SendAsync("Player:Resync", roomCode, uid);
                }
            }
        }

        private async Task UpdateUID(string uid)
        {
            await JSRuntime.InvokeVoidAsync("SetPlayerUID", uid);
        }

        private void Redirect()
        {
            NavigationManager.NavigateTo("/");
        }
    }
}