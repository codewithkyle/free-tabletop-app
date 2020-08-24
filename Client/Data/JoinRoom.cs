using System;
using System.ComponentModel.DataAnnotations;

namespace FreeTabletop.Data
{
    public class JoinRoom
    {
        [Required(
            ErrorMessage = "A Room Code is requried"
        )]
        [StringLength(6,
            ErrorMessage = "Invalid Room Code length")]
        public string RoomCode { get; set; }
    }
}