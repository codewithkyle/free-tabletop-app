
using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.SignalR.Client;
using System.Threading.Tasks;

namespace FreeTabletop.Client.Models
{
    public static class Networker
    {
        public static HubConnection hubConnection = null;
        public static bool IsConnected = false;

        public static async Task Connect(System.Uri url)
        {
            if (IsConnected){
                await hubConnection.DisposeAsync();
            }
            hubConnection = new HubConnectionBuilder()
            .WithUrl(url)
            .Build();
            await hubConnection.StartAsync();
            IsConnected = hubConnection.State == HubConnectionState.Connected;
        }
    }
}