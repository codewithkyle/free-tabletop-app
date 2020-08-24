using System;
using System.ComponentModel.DataAnnotations;

namespace Tabletop.Data
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