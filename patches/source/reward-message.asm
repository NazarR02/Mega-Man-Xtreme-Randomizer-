; Short native-font HUD text at window row 1, columns 2..9 (below HP).
SECTION "Reward notification", ROMX[$5000], BANK[$40]
RewardPickupHook::
    push hl
    ld a, $3f
    ld hl, $7b17
    rst $00
    pop hl
    push af
    push bc
    push de
    push hl
    call RewardEnqueue
.done
    pop hl
    pop de
    pop bc
    pop af
    ret
RewardMessage:
    ldh a, [$ffff]
    push af
    di
    xor a
    ldh [$ffff], a
    ldh a, [$ff40]
    push af
    ld a, [$cf5c]
    push af
    ldh a, [$ff4f]
    push af
    add sp, -96
    call $0d5f
    xor a
    ldh [$ff4f], a
    ; Temporary 64-byte usage table shares storage with the later backups.
    ld hl, sp+16
    ld b, $40
.clearUsage
    ld [hl+], a
    dec b
    jr nz, .clearUsage
    ld hl, sp+16
    ld b, h
    ld c, l
    ld hl, $9800
.markMap
    ld a, [hl+]
    call MarkUsedPair
    ld a, h
    cp $a0
    jr nz, .markMap
    ; Upper signed BG tiles overlap OBJ VRAM. Mark every OAM tile pair.
    ld hl, $fe02
.markOam
    ld a, [hl]
    bit 7, a
    jr z, .nextOam
    call MarkUsedPair
.nextOam
    inc hl
    inc hl
    inc hl
    inc hl
    ld a, l
    cp $a2
    jr nz, .markOam
    ld hl, sp+84
    xor a
    ld [hl], a
    ld c, $02
.candidate
    ld a, c
    rrca
    rrca
    and $3f
    ld e, a
    ld d, $00
    ld hl, sp+16
    add hl, de
    bit 1, c
    jr nz, .secondPair
    bit 0, [hl]
    jr .pairChecked
.secondPair
    bit 1, [hl]
.pairChecked
    jr nz, .used
    ld a, c
    call TileAddress
    ld b, $20
.blankTile
    ld a, [hl+]
    and a
    jr nz, .used
    dec b
    jr nz, .blankTile
    ld hl, sp+84
    ld e, [hl]
    inc [hl]
    ld d, $00
    ld hl, sp+0
    add hl, de
    ld [hl], c
    ld hl, sp+84
    ld a, [hl]
    cp $04
    jr z, .found
.used
    ld a, c
    add $02
    ld c, a
    jr nz, .candidate
    jp RewardCloseStates
.found
    ld hl, sp+16
    ld d, h
    ld e, l
    ld hl, $9c22
    ld b, 8
    call Copy
    ldh a, [$ff91]
    and a
    jr z, .saved
    ld a, 1
    ldh [$ff4f], a
    ld hl, sp+24
    ld d, h
    ld e, l
    ld hl, $9c22
    ld b, 8
    call Copy
    xor a
    ldh [$ff4f], a
.saved
    call RewardName
    ld de, $9c22
    ld c, 0
    call RewardText
    ; Use the original black/white HUD palette 7. No palette is overwritten.
    ldh a, [$ff91]
    and a
    jr z, .drawn
    ld a, 1
    ldh [$ff4f], a
    ld hl, $9c22
    ld b, 8
    ld a, 7
.attributes
    ld [hl+], a
    dec b
    jr nz, .attributes
    xor a
    ldh [$ff4f], a
.drawn
    call $0d80
RewardVisible::
    ; Keep only tile ownership after returning to normal gameplay.
    ld hl, sp+0
    ld de, $d3f4
    ld b, 4
    call Copy
    ld a, 90
    ld [$d3f2], a
RewardCloseStates::
    add sp, 96
    pop af
    ldh [$ff4f], a
    pop af
    ld [$cf5c], a
    pop af
    ldh [$ff40], a
    pop af
    ldh [$ffff], a
    ei
    ret
; HL encoded string; DE HUD map destination; C glyph slot 0..7.
RewardText:
    ld a, [hl+]
    cp $ff
    jr nz, .glyph
    dec hl
    xor a
.glyph
    push hl
    push de
    push bc
    ld b, a
    ld a, c
    srl a
    ld e, a
    ld d, 0
    ld hl, sp+8
    add hl, de
    ld a, c
    and 1
    add [hl]
    push af
    call TileAddress
    ld d, h
    ld e, l
    ld l, b
    ld h, 0
    add hl, hl
    add hl, hl
    add hl, hl
    add hl, hl
    ld bc, RewardFont
    add hl, bc
    ld b, 16
    call Copy
    pop af
    pop bc
    pop de
    pop hl
    ld [de], a
    inc de
    inc c
    ld a, c
    cp 8
    jr c, RewardText
    ret
RewardName:
    ld a, [$d3e0]
    dec a
    cp 8
    ld hl, RewardUnknown
    ret nc
    add a
    ld c, a
    ld b, 0
    ld hl, RewardGroups
    add hl, bc
    ld a, [hl+]
    ld h, [hl]
    ld l, a
    ld a, [$d3e0]
    cp 1
    ret z
    cp 2
    ret z
    cp 8
    ret z
    cp 6
    ld a, [$d3e1]
    jr z, .weapon
    ; Armor/Zero/keys are bit masks; compressed starting rewards never enter.
    ld b, 0
.bit
    rrca
    jr c, .index
    inc b
    ld c, a
    ld a, b
    cp 8
    ld a, c
    jr c, .bit
    ld hl, RewardUnknown
    ret
.weapon
    cp 8
    jr c, .weaponValid
    ld hl, RewardUnknown
    ret
.weaponValid
    ld b, a
.index
    ld a, b
    add a
    ld c, a
    ld b, 0
    add hl, bc
    ld a, [hl+]
    ld h, [hl]
    ld l, a
    ret
RewardPalette:
    db 0,0,0,0,0,0,$ff,$7f
RewardGroups:
    dw RewardHeart, RewardSub, RewardArmor, RewardZero
    dw RewardKeys, RewardWeapons, RewardSigma, RewardShotokan
RewardArmor:
    dw RewardHelmet, RewardBuster, RewardBody, RewardBoots
    dw RewardUnknown, RewardUnknown, RewardUnknown, RewardUnknown
RewardZero:
    dw RewardZero1, RewardZero2, RewardZero3, RewardZero4
    dw RewardUnknown, RewardUnknown, RewardUnknown, RewardUnknown
RewardKeys:
    dw RewardPenguinKey, RewardMandrillKey, RewardArmadilloKey, RewardEagleKey
    dw RewardMothKey, RewardGatorKey, RewardCentipedeKey, RewardStagKey
RewardWeapons:
    dw RewardIce, RewardSpark, RewardShield, RewardTornado
    dw RewardSilk, RewardWheel, RewardMine, RewardBurner
RewardSigma:
    dw RewardSigma1, RewardSigma2
    dw RewardUnknown, RewardUnknown, RewardUnknown, RewardUnknown, RewardUnknown, RewardUnknown
RewardUnknown:
    db 9,20,5,13,$ff
RewardHeart:
    db 8,16,0,21,16,$ff
RewardSub:
    db 19,21,2,20,1,14,11,$ff
RewardShotokan:
    db 19,8,15,20,15,11,$ff
RewardHelmet:
    db 8,5,12,13,$ff
RewardBuster:
    db 2,21,19,20,5,18,$ff
RewardBody:
    db 2,15,4,25,$ff
RewardBoots:
    db 2,15,15,20,19,$ff
RewardZero1:
    db 26,40,19,11,28,$ff
RewardZero2:
    db 26,40,19,11,29,$ff
RewardZero3:
    db 26,40,19,11,30,$ff
RewardZero4:
    db 26,40,19,11,31,$ff
RewardPenguinKey:
    db 11,40,16,5,14,7,$ff
RewardMandrillKey:
    db 11,40,13,1,14,4,$ff
RewardArmadilloKey:
    db 11,40,1,18,13,1,$ff
RewardEagleKey:
    db 11,40,5,1,7,$ff
RewardMothKey:
    db 11,40,13,15,20,8,$ff
RewardGatorKey:
    db 11,40,7,1,20,18,$ff
RewardCentipedeKey:
    db 11,40,3,5,14,20,$ff
RewardStagKey:
    db 11,40,19,20,1,7,$ff
RewardIce:
    db 19,40,9,3,5,$ff
RewardSpark:
    db 5,40,19,16,1,18,11,$ff
RewardShield:
    db 18,40,19,8,9,5,12,4,$ff
RewardTornado:
    db 19,40,20,15,18,14,$ff
RewardSilk:
    db 19,40,19,8,15,20,$ff
RewardWheel:
    db 19,40,23,8,5,5,12,$ff
RewardMine:
    db 13,40,13,9,14,5,$ff
RewardBurner:
    db 19,40,2,21,18,14,$ff
RewardSigma1:
    db 11,40,19,9,7,28,$ff
RewardSigma2:
    db 11,40,19,9,7,29,$ff
RewardFont:
    INCBIN "reward-font.bin"

; D3F2 timer; D3F3 C0 | (stage << 3) | queue length; D3F4..F7 tiles;
; D3F8..FD three queued (type,value) pairs; D3FE/FF current reward.
; These 14 WRAM bytes were unused.
; This is volatile HUD state, never SRAM or persistent item inventory.
SECTION "Async reward HUD", ROMX[$5c00], BANK[$40]
RewardFrameHook::
    ldh a, [$ff4f]
    push af
    xor a
    ldh [$ff4f], a
    call RewardTick
    pop af
    ldh [$ff4f], a
    ret
RewardTick:
    ldh a, [$ff91]
    and a
    jr z, .bankReady
    ldh a, [$ff70]
    and 7
    cp 2
    ret nc
.bankReady
    call RewardStateValid
    ret nc
    ld a, [$d3f2]
    and a
    jr z, .pending
    call RewardHudLayout
    ret nc
    call RewardOwnsMap
    jr nc, .lost
    ld hl, $d3f2
    dec [hl]
    ret nz
    call RewardErase
.pending
    ld a, [$d3f3]
    and 7
    ret z
    call RewardHudLayout
    ret nc
    ; The original HUD reserves these eight cells as blank $FF tiles.
    ld hl, $9c22
    ld b, 8
.blank
    call RewardReadVram
    inc hl
    ld c, a
    ld a, b
    cp 1
    ld a, c
    jr z, .lastBlank
    cp $ff
    ret nz
    jr .nextBlank
.lastBlank
    cp $fe
    ret nz
.nextBlank
    dec b
    jr nz, .blank
    ld a, [$d3e0]
    push af
    ld a, [$d3e1]
    push af
    ld a, [$d3f8]
    ld [$d3fe], a
    ld [$d3e0], a
    ld a, [$d3f9]
    ld [$d3ff], a
    ld [$d3e1], a
    call RewardMessage
    pop af
    ld [$d3e1], a
    pop af
    ld [$d3e0], a
    ; Remove this queued message after setup; a failed allocation drops it
    ; instead of repeatedly interrupting frame rendering.
    ld hl, $d3fa
    ld de, $d3f8
    ld b, 4
    call Copy
    ld hl, $d3f3
    dec [hl]
    ret
.lost
    ; Menu/stage code owns the new map/tiles now. Do not erase its graphics.
    xor a
    ld [$d3f2], a
    ret
RewardStateValid:
    ld a, [$d3f3]
    and $c0
    cp $c0
    jr nz, .bad
    ld a, [$d3f3]
    and 7
    cp 4
    jr nc, .bad
    ld a, [$d35f]
    cp 8
    jr nc, .bad
    add a
    add a
    add a
    ld b, a
    ld a, [$d3f3]
    and $38
    cp b
    jr nz, .bad
    scf
    ret
.bad
    and a
    ret
RewardEnqueue:
    call RewardStateValid
    jr c, .ready
    xor a
    ld [$d3f2], a
    ld a, [$d35f]
    cp 8
    ret nc
    add a
    add a
    add a
    or $c0
    ld [$d3f3], a
.ready
    ld a, [$d3f3]
    and 7
    ld b, a
    ld a, [$d3f2]
    and a
    jr z, .scanQueue
    ld a, [$d3e0]
    ld hl, $d3fe
    cp [hl]
    jr nz, .scanQueue
    inc hl
    ld a, [$d3e1]
    cp [hl]
    ret z
.scanQueue
    ld hl, $d3f8
    ld a, b
    and a
    jr z, .append
.scan
    ld a, [$d3e0]
    cp [hl]
    inc hl
    jr nz, .different
    ld a, [$d3e1]
    cp [hl]
    ret z
.different
    inc hl
    dec b
    jr nz, .scan
.append
    ld a, [$d3f3]
    and 7
    cp 3
    ret nc
    add a
    ld e, a
    ld d, 0
    ld hl, $d3f8
    add hl, de
    ld a, [$d3e0]
    ld [hl+], a
    ld a, [$d3e1]
    ld [hl], a
    ld hl, $d3f3
    inc [hl]
    ret
RewardHudLayout:
    ldh a, [$ff40]
    and $f0
    cp $e0
    jr nz, .bad
    ldh a, [$ff4a]
    cp 128
    jr nz, .bad
    ldh a, [$ff4b]
    cp 7
    jr nz, .bad
    scf
    ret
.bad
    and a
    ret
RewardOwnsMap:
    ldh a, [$ff4f]
    push af
    xor a
    ldh [$ff4f], a
    ld hl, $9c22
    ld de, $d3f4
    ld b, 4
.pair
    ld a, [de]
    ld c, a
    call RewardReadVram
    cp c
    jr nz, .no
    inc hl
    inc c
    call RewardReadVram
    cp c
    jr nz, .no
    inc hl
    inc de
    dec b
    jr nz, .pair
    pop af
    ldh [$ff4f], a
    scf
    ret
.no
    pop af
    ldh [$ff4f], a
    and a
    ret
RewardErase:
    ldh a, [$ff4f]
    push af
    xor a
    ldh [$ff4f], a
    ld hl, $9c22
    ld b, 7
.map
    ld a, $ff
    call RewardWriteVram
    inc hl
    dec b
    jr nz, .map
    ld a, $fe
    call RewardWriteVram
    ld de, $d3f4
    ld c, 4
.pair
    ld a, [de]
    inc de
    call TileAddress
    ld b, 32
.byte
    xor a
    call RewardWriteVram
    inc hl
    dec b
    jr nz, .byte
    dec c
    jr nz, .pair
    pop af
    ldh [$ff4f], a
    ret
; Atomic STAT-gated accesses, preserving caller counters and data.
RewardReadVram:
    di
.wait
    ldh a, [$ff41]
    and 2
    jr nz, .wait
    ld a, [hl]
    ei
    ret
RewardWriteVram:
    push af
    di
.wait
    ldh a, [$ff41]
    and 2
    jr nz, .wait
    pop af
    ld [hl], a
    ei
    ret
