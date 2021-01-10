using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.SignalR.Client;
using FreeTabletop.Shared.Models;
using Microsoft.JSInterop;
using FreeTabletop.Client.Pages;
using FreeTabletop.Client.Models;
using System.Timers;

namespace FreeTabletop.Client.Controllers
{
    public class ClientHub
    {
        private NavigationManager NavigationManager { get; set; }

        private IJSRuntime JSRuntime { get; set; }

        private RoomBase Room { get; set; }

        private Tabletop Tabletop { get; set; }

        string RoomCode { get; set; }

        private static Timer Timer;

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
                if (!newConnection)
                {
                    MessageReset();
                }
                Networker.hubConnection.On("Error:RoomNotFound", Redirect);
                Networker.hubConnection.On("Error:PlayerNotFound", Redirect);

                Networker.hubConnection.On<bool, List<PlayerEntity>, string, bool, List<Image>>("Sync:TabletopInfo", Room.SyncTabletop);
                Networker.hubConnection.On<List<Entity>>("Sync:CombatOrder", Room.UpdateCombatOrder);

                Networker.hubConnection.On<string>("Set:PlayerUID", UpdateUID);
                Networker.hubConnection.On<bool, string, string>("Set:PlayerStatus", Room.UpdatePlayerStatus);
                Networker.hubConnection.On<Message>("Set:Message", Room.RenderMessage);

                Networker.hubConnection.On("Player:Kick", HandleKick);

                Networker.hubConnection.On<String, string, int[], int, int[], List<Cell>, bool, bool>("Tabletop:LoadImage", Room.RenderTabletopFromImage);
                Networker.hubConnection.On("Tabletop:Clear", Room.ClearTabletop);
                Networker.hubConnection.On<List<PlayerEntity>>("Tabletop:RenderPlayerEntities", Room.RenderPlayerEntities);
                Networker.hubConnection.On<List<Creature>>("Tabletop:RenderCreatureEntities", Room.RenderCreatureEntities);
                Networker.hubConnection.On<List<NPC>>("Tabletop:RenderNPCEntities", Room.RenderNPCEntities);
                Networker.hubConnection.On<int, string>("Tabletop:SyncCells", Room.SyncCells);
                Networker.hubConnection.On<string, int[]>("Tabletop:UpdateEntityPosition", UpdateEntityPosition);
                Networker.hubConnection.On<bool>("Tabletop:UpdateLock", Room.UpdateLock);
                Networker.hubConnection.On<Image>("Tabletop:LoadPopupImage", RenderPopupImage);
                Networker.hubConnection.On<bool>("Tabletop:ToggleVisibility", Room.SetTabletopVisibility);
                Networker.hubConnection.On<List<Light>>("Tabletop:RenderLightEntities", Room.RenderLightEntities);

                Networker.hubConnection.On<string>("Notification:PlayerConnected", ConnectedNotification);
                Networker.hubConnection.On<string, string>("Notification:PlayerDisconnected", DisconnectedNotification);
                Networker.hubConnection.On<string>("Notification:PlayerReconnected", ReconnectedNotification);
                Networker.hubConnection.On<string>("Notification:PlayerKicked", KickNotification);
                Networker.hubConnection.On("Notification:TakeTurn", TakeTurnNotification);
                Networker.hubConnection.On("Notification:OnDeck", OnDeckNotification);
                Networker.hubConnection.On<string>("Notification:EntityOnDeck", EntityOnDeckNotification);
                Networker.hubConnection.On<int, int>("Notification:Ping", Room.RenderPing);
                Networker.hubConnection.On<int, string, string, string>("Notification:Roll", Room.RenderRollNotification);

                Networker.hubConnection.On<string>("Entity:RenderDeathCelebration", RenderDeathCelebration);
                Networker.hubConnection.On<Entity, string>("Entity:UpdateCondition", Room.UpdateEntityCondition);
                Networker.hubConnection.On<Entity>("Entity:ToggleVisibility", Room.UpdateEntityVisibility);
                Networker.hubConnection.On<string, int>("Entity:UpdateFoV", Room.UpdateEntityFoV);
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

            await Networker.hubConnection.SendAsync("Player:GetStatus");
            await Networker.hubConnection.SendAsync("Player:SyncTabletopInfo");
        }

        private void MessageReset()
        {
            Networker.hubConnection.Remove("Error:RoomNotFound");
            Networker.hubConnection.Remove("Error:PlayerNotFound");
            Networker.hubConnection.Remove("Sync:TabletopInfo");
            Networker.hubConnection.Remove("Sync:CombatOrder");
            Networker.hubConnection.Remove("Set:PlayerUID");
            Networker.hubConnection.Remove("Set:PlayerStatus");
            Networker.hubConnection.Remove("Player:Kick");
            Networker.hubConnection.Remove("Set:Message");

            Networker.hubConnection.Remove("Tabletop:LoadImage");
            Networker.hubConnection.Remove("Tabletop:Clear");
            Networker.hubConnection.Remove("Tabletop:RenderPlayerEntities");
            Networker.hubConnection.Remove("Tabletop:RenderCreatureEntities");
            Networker.hubConnection.Remove("Tabletop:RenderNPCEntities");
            Networker.hubConnection.Remove("Tabletop:SyncCells");
            Networker.hubConnection.Remove("Tabletop:UpdateEntityPosition");
            Networker.hubConnection.Remove("Tabletop:UpdateLock");
            Networker.hubConnection.Remove("Tabletop:LoadPopupImage");
            Networker.hubConnection.Remove("Tabletop:ToggleVisibility");
            Networker.hubConnection.Remove("Tabletop:RenderLightEntities");

            Networker.hubConnection.Remove("Notification:PlayerConnected");
            Networker.hubConnection.Remove("Notification:PlayerDisconnected");
            Networker.hubConnection.Remove("Notification:PlayerReconnected");
            Networker.hubConnection.Remove("Notification:PlayerKicked");
            Networker.hubConnection.Remove("Notification:TakeTurn");
            Networker.hubConnection.Remove("Notification:OnDeck");
            Networker.hubConnection.Remove("Notification:EntityOnDeck");
            Networker.hubConnection.Remove("Notification:Ping");
            Networker.hubConnection.Remove("Notification:Roll");

            Networker.hubConnection.Remove("Entity:UpdateCondition");
            Networker.hubConnection.Remove("Entity:RenderDeathCelebration");
            Networker.hubConnection.Remove("Entity:UpdateVisibility");
            Networker.hubConnection.Remove("Entity:UpdateFoV");
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

        public void ToggleRoomLock()
        {
            try
            {
                Networker.hubConnection.SendAsync("Room:ToggleLock");
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }

        public void KickPlayer(PlayerEntity player)
        {
            try
            {
                Networker.hubConnection.SendAsync("Room:KickPlayer", player.UID);
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }

        public void LoadTabletop(String imageURL, string gridType, int[] gridData, int gridCellSize, bool fogOfWar, bool advanced, bool pvp)
        {
            int[] GridSize = {gridData[0], gridData[1]};
            int[] TabletopSize = {gridData[2], gridData[3]};
            try
            {
                Networker.hubConnection.SendAsync("Room:LoadImage", imageURL, gridType, GridSize, gridCellSize, TabletopSize, fogOfWar, advanced, pvp);
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }

        public void ClearTabletop()
        {
            try
            {
                Networker.hubConnection.SendAsync("Room:ClearTabletop");
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }

        public void MoveEntity(string entityUID, int[] newPosition)
        {
            try
            {
                Networker.hubConnection.SendAsync("Room:MoveEntity", entityUID, newPosition);
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }

        public void SpawnCreature(Creature creature)
        {
            try
            {
                Networker.hubConnection.SendAsync("Room:SpawnCreature", creature);
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }

        public void SpawnNPC(NPC npc)
        {
            try
            {
                Networker.hubConnection.SendAsync("Room:SpawnNPC", npc);
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }
        public void SyncCombatOrder()
        {            
            try
            {
                Networker.hubConnection.SendAsync("Room:SyncCombatOrder");
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }

        public void RemoveEntityFromCombatOrder(string uid)
        {
            try
            {
                Networker.hubConnection.SendAsync("Room:RemoveEntityFromCombatOrder", uid);
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }

        public void UpdateEntityCombatOrderPosition(string uid, int newPosition)
        {
            try
            {
                Networker.hubConnection.SendAsync("Room:UpdateEntityCombatOrderPosition", uid, newPosition);
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }

        private void ConnectedNotification(string name)
        {
            JSRuntime.InvokeVoidAsync("PlayerConnected", name);
        }
        private void DisconnectedNotification(string name, string uid)
        {
            JSRuntime.InvokeVoidAsync("PlayerDisconnected", name);
            for (int i = 0; i < Tabletop.Players.Count; i++)
            {
                if (Tabletop.Players[i].UID == uid)
                {
                    Tabletop.Players[i].IsConnected = false;
                    break;
                }
            }
        }
        private void ReconnectedNotification(string name)
        {
            JSRuntime.InvokeVoidAsync("PlayerReconnected", name);
        }
        private void KickNotification(string name)
        {
            JSRuntime.InvokeVoidAsync("PlayerKicked", name);
        }
        private void TakeTurnNotification()
        {
            JSRuntime.InvokeVoidAsync("TakeTurn");
        }
        private void OnDeckNotification()
        {
            JSRuntime.InvokeVoidAsync("OnDeck");
        }
        private void EntityOnDeckNotification(string name)
        {
            JSRuntime.InvokeVoidAsync("EntityOnDeck", name);
        }

        public void PingEntity(string uid)
        {
            try
            {
                Networker.hubConnection.SendAsync("Room:PingEntity", uid);
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }

        public void UpdateEntityAC(Entity entity, int ac)
        {
            try
            {
                Networker.hubConnection.SendAsync("Room:UpdateEntityAC", entity.UID, ac);
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }

        public void UpdateEntityFoV(Entity entity, int fov)
        {
            try
            {
                Networker.hubConnection.SendAsync("Room:UpdateEntityFoV", entity.UID, fov);
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }

        public void UpdateEntityHP(Entity entity, int hp)
        {
            try
            {
                Networker.hubConnection.SendAsync("Room:UpdateEntityHP", entity.UID, hp);
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }

        public void Ping(int x, int y)
        {
            try
            {
                Networker.hubConnection.SendAsync("Room:Ping", x, y);
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }

        public void SendMessage(string activePlayerUID, string msg)
        {
            try
            {
                if (activePlayerUID != null)
                {
                    Networker.hubConnection.SendAsync("Player:Message", msg, activePlayerUID);
                }
                else
                {
                    Networker.hubConnection.SendAsync("Room:Message", msg);
                }
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }

        public void Disconnect()
        {
            try
            {
                Networker.hubConnection.SendAsync("Player:Disconnect");
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }

        public void RemoveEntity(string uid)
        {
            try
            {
                Networker.hubConnection.SendAsync("Room:RemoveEntity", uid);
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }

        public void AnnounceRoll(int diceCount, string die, string results)
        {
            try
            {
                Networker.hubConnection.SendAsync("Room:AnnounceRoll", diceCount, die, results);
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }

        public void ChangeCellStyle(int cellIndex, string style)
        {
            try
            {
                Networker.hubConnection.SendAsync("Room:ChangeCellStyle", cellIndex, style);
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }

        public void UpdateEntityPosition(string uid, int[] position)
        {
            JSRuntime.InvokeVoidAsync("UpdateEntityPosition", uid, position, Tabletop.CellSize);
        }

        public void LoadPopupImage(string url, string label)
        {
            try
            {
                Networker.hubConnection.SendAsync("Room:LoadPopupImage", url, label);
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }

        public void RenderPopupImage(Image image)
        {
            Room.RenderPopupImage(image, true);
        }

        public void SetBleeding(string uid, bool isBleeding)
        {
            try
            {
                Networker.hubConnection.SendAsync("Room:SetBleeding", uid, isBleeding);
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }

        public void SetBurning(string uid, bool isBurning)
        {
            try
            {
                Networker.hubConnection.SendAsync("Room:SetBurning", uid, isBurning);
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }

        public void SetPoison(string uid, bool isPoisoned)
        {
            try
            {
                Networker.hubConnection.SendAsync("Room:SetPoison", uid, isPoisoned);
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }

        public void SetConcentration(string uid, bool isConcentrating)
        {
            try
            {
                Networker.hubConnection.SendAsync("Room:SetConcentration", uid, isConcentrating);
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }

        public void RenderDeathCelebration(string uid)
        {
            JSRuntime.InvokeVoidAsync("RenderDeathCelebration", uid);
        }

        public void ToggleCondition(string uid, string condition)
        {
            try
            {
                Networker.hubConnection.SendAsync("Entity:ToggleCondition", uid, condition);
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }

        public void ToggleEntityVisibility(string uid)
        {
            try
            {
                Networker.hubConnection.SendAsync("Entity:ToggleVisibility", uid);
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }

        public void ToggleTabletopVisibility()
        {
            try
            {
                Networker.hubConnection.SendAsync("Room:ToggleVisibility");
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }

        public void SpawnLight(int x, int y)
        {
            try
            {
                Networker.hubConnection.SendAsync("Room:SpawnLight", x, y);
            }
            catch
            {
                JSRuntime.InvokeVoidAsync("PromptReload");
            }
        }
    }
}
