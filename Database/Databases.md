## **\#1.**/\* Table \[dbo\].\[ChucvuSV\]    Script Date: 15/07/2025 2:52:29 PM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[ChucvuSV\](  
	\[MaCVSV\] \[nvarchar\](10) NOT NULL,  
	\[ChucvuSV\] \[nvarchar\](100) NOT NULL,  
	\[TT\] \[int\] NULL,  
	\[Macdinh\] \[bit\] NULL,  
 CONSTRAINT \[PK\_ChucvuSV\] PRIMARY KEY CLUSTERED   
(  
	\[MaCVSV\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[ChucvuSV\] ADD  CONSTRAINT \[DF\_ChucvuSV\_TT\]  DEFAULT (0) FOR \[TT\]  
GO

ALTER TABLE \[dbo\].\[ChucvuSV\] ADD  CONSTRAINT \[DF\_ChucvuSV\_Macdinh\]  DEFAULT (0) FOR \[Macdinh\]  
GO

## **\#2.**/\* Table \[dbo\].\[CTDTLop\]    Script Date: 15/07/2025 2:53:47 PM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[CTDTLop\](  
	\[MaL\] \[nvarchar\](10) NOT NULL,  
	\[MaHP\] \[nvarchar\](10) NOT NULL,  
	\[MaCN\] \[nvarchar\](10) NOT NULL,  
	\[MaHK\] \[nvarchar\](10) NULL,  
	\[Hocky\] \[int\] NULL,  
	\[Sotiet\] \[int\] NULL,  
	\[Sotinchi\] \[real\] NULL,  
	\[SotinchiLT\] \[real\] NULL,  
	\[SotinchiTH\] \[real\] NULL,  
	\[Dieukien\] \[bit\] NULL,  
	\[MaNHPTC\] \[nvarchar\](10) NULL,  
	\[Tienquyet\] \[nvarchar\](200) NULL,  
	\[Hoctruoc\] \[nvarchar\](200) NULL,  
	\[Songhanh\] \[nvarchar\](200) NULL,  
	\[Thaythe\] \[nvarchar\](200) NULL,  
	\[ID\] \[int\] NULL,  
	\[Khongtinhdiem\] \[bit\] NULL,  
	\[Giaidoan2\] \[bit\] NULL,  
	\[KhongtinhdiemHB\] \[bit\] NULL,  
	\[Khonghiendiem\] \[bit\] NULL,  
	\[MasoHP\] \[nvarchar\](20) NULL,  
	\[DaybangtiengViet\] \[bit\] NULL,  
	\[KhongxetHocvu\] \[bit\] NULL,  
 CONSTRAINT \[PK\_\_CTDTLop\_\_1E505424\] PRIMARY KEY CLUSTERED   
(  
	\[MaL\] ASC,  
	\[MaHP\] ASC,  
	\[MaCN\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[CTDTLop\] ADD  CONSTRAINT \[DF\_\_CTDTLop\_\_MaCN\_\_1D5C2FEB\]  DEFAULT ('000') FOR \[MaCN\]  
GO

ALTER TABLE \[dbo\].\[CTDTLop\] ADD  CONSTRAINT \[DF\_CTDT\_Dieukien\]  DEFAULT (0) FOR \[Dieukien\]  
GO

ALTER TABLE \[dbo\].\[CTDTLop\] ADD  CONSTRAINT \[DF\_CTDTLop\_ID\]  DEFAULT (0) FOR \[ID\]  
GO

ALTER TABLE \[dbo\].\[CTDTLop\] ADD  CONSTRAINT \[DF\_\_CTDTLop\_\_Khongti\_\_18977ACE\]  DEFAULT (0) FOR \[Khongtinhdiem\]  
GO

ALTER TABLE \[dbo\].\[CTDTLop\] ADD  DEFAULT (0) FOR \[Giaidoan2\]  
GO

ALTER TABLE \[dbo\].\[CTDTLop\] ADD  DEFAULT (0) FOR \[KhongtinhdiemHB\]  
GO

ALTER TABLE \[dbo\].\[CTDTLop\] ADD  DEFAULT (0) FOR \[Khonghiendiem\]  
GO

ALTER TABLE \[dbo\].\[CTDTLop\] ADD  DEFAULT ((0)) FOR \[DaybangtiengViet\]  
GO

ALTER TABLE \[dbo\].\[CTDTLop\] ADD  DEFAULT ((0)) FOR \[KhongxetHocvu\]  
GO

ALTER TABLE \[dbo\].\[CTDTLop\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_CTDTCT\_Hocphan\] FOREIGN KEY(\[MaHP\])  
REFERENCES \[dbo\].\[Hocphan\] (\[MaHP\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[CTDTLop\] CHECK CONSTRAINT \[FK\_CTDTCT\_Hocphan\]  
GO

ALTER TABLE \[dbo\].\[CTDTLop\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_CTDTLop\_Lop\] FOREIGN KEY(\[MaL\])  
REFERENCES \[dbo\].\[Lop\] (\[MaL\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[CTDTLop\] CHECK CONSTRAINT \[FK\_CTDTLop\_Lop\]  
GO

ALTER TABLE \[dbo\].\[CTDTLop\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_CTDTLop\_NhomHPTC\] FOREIGN KEY(\[MaNHPTC\])  
REFERENCES \[dbo\].\[NhomHPTC\] (\[MaNHPTC\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[CTDTLop\] CHECK CONSTRAINT \[FK\_CTDTLop\_NhomHPTC\]  
GO

## **\#3.**/\* Table \[dbo\].\[Dantoc\]    Script Date: 15/07/2025 2:54:31 PM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[Dantoc\](  
	\[MaDT\] \[nvarchar\](10) NOT NULL,  
	\[Dantoc\] \[nvarchar\](50) NOT NULL,  
	\[TT\] \[tinyint\] NULL,  
	\[Macdinh\] \[bit\] NOT NULL,  
 CONSTRAINT \[PK\_Dantoc\] PRIMARY KEY CLUSTERED   
(  
	\[MaDT\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[Dantoc\] ADD  CONSTRAINT \[DF\_Dantoc\_Macdinh\]  DEFAULT ((0)) FOR \[Macdinh\]  
GO

## **\#4.**/\* Table \[dbo\].\[db\_DMhanhchinh\_new\]    Script Date: 15/07/2025 2:55:08 PM \*\*\*\*\*\***Phát sinh  mới \***/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[db\_DMhanhchinh\_new\](  
	\[MaXa\] \[nvarchar\](10) NOT NULL,  
	\[TenXa\] \[nvarchar\](100) NOT NULL,  
	\[Cap\] \[nvarchar\](50) NULL,  
	\[MaTinh\] \[nvarchar\](5) NOT NULL,  
	\[TenTinh\] \[nvarchar\](50) NOT NULL,  
 CONSTRAINT \[PK\_db\_DMhanhchinh\_new\] PRIMARY KEY CLUSTERED   
(  
	\[MaXa\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

## **\#5.**/\* Table \[dbo\].\[db\_s\_tblAudittrail\]    Script Date: 15/07/2025 2:56:04 PM \*\*\*\*\*\***Phát sinh  mới \***/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[db\_s\_tblAudittrail\](  
	\[ID\] \[int\] IDENTITY(1,1) NOT NULL,  
	\[Times\] \[datetime\] NULL,  
	\[UserID\] \[nvarchar\](20) NULL,  
	\[UserLevel\] \[nvarchar\](10) NULL,  
	\[ComputerName\] \[nvarchar\](50) NULL,  
	\[Modul\] \[nvarchar\](50) NULL,  
	\[Action\] \[nvarchar\](200) NULL,  
 CONSTRAINT \[PK\_db\_s\] PRIMARY KEY CLUSTERED   
(  
	\[ID\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

## **\#6.**/\* Table \[dbo\].\[DTCS\]    Script Date: 15/07/2025 2:57:10 PM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[DTCS\](  
	\[MaDTCS\] \[nvarchar\](10) NOT NULL,  
	\[DTCS\] \[nvarchar\](100) NOT NULL,  
	\[TT\] \[int\] NULL,  
	\[Macdinh\] \[bit\] NOT NULL,  
	\[DiemUT\] \[real\] NULL,  
 CONSTRAINT \[PK\_DTCS\] PRIMARY KEY CLUSTERED   
(  
	\[MaDTCS\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[DTCS\] ADD  CONSTRAINT \[DF\_DTCS\_Macdinh\]  DEFAULT ((0)) FOR \[Macdinh\]  
GO

## **\#7.**/\* Table \[dbo\].\[KhoaHoc\]    Script Date: 15/07/2025 3:00:15 PM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[KhoaHoc\](  
	\[MaKH\] \[nvarchar\](10) NOT NULL,  
	\[Khoahoc\] \[nvarchar\](20) NULL,  
	\[NgayKG\] \[smalldatetime\] NULL,  
	\[Soluong\] \[int\] NULL,  
	\[HeDT\] \[nvarchar\](5) NULL,  
	\[TenKH\] \[nvarchar\](50) NULL,  
	\[Nam\] \[int\] NULL,  
	\[Sothang\] \[int\] NULL,  
 CONSTRAINT \[PK\_KhoaHoc\] PRIMARY KEY CLUSTERED   
(  
	\[MaKH\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

## **\#8.**/\* Table \[dbo\].\[t\_NhatkyGV\]    Script Date: 15/07/2025 3:06:02 PM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[t\_NhatkyGV\](  
	\[ID\] \[int\] IDENTITY(1,1) NOT NULL,  
	\[Thoigian\] \[datetime\] NULL,  
	\[MaGV\] \[nvarchar\](10) NULL,  
	\[Congviec\] \[nvarchar\](200) NULL,  
	\[Ghichu\] \[nvarchar\](2000) NULL,  
PRIMARY KEY CLUSTERED   
(  
	\[ID\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[t\_NhatkyGV\]  WITH CHECK ADD  CONSTRAINT \[FK\_t\_NhatkyGV\_Giaovien\] FOREIGN KEY(\[MaGV\])  
REFERENCES \[dbo\].\[Giaovien\] (\[MaGV\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[t\_NhatkyGV\] CHECK CONSTRAINT \[FK\_t\_NhatkyGV\_Giaovien\]  
GO

## **\#9.**/\* Table \[dbo\].\[Tongiao\]    Script Date: 15/07/2025 3:06:55 PM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[Tongiao\](  
	\[MaTG\] \[nvarchar\](10) NOT NULL,  
	\[Tongiao\] \[nvarchar\](15) NOT NULL,  
	\[TT\] \[tinyint\] NULL,  
	\[Macdinh\] \[bit\] NOT NULL,  
 CONSTRAINT \[PK\_TonGiao\] PRIMARY KEY CLUSTERED   
(  
	\[MaTG\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[Tongiao\] ADD  CONSTRAINT \[DF\_TonGiao\_Macdinh\]  DEFAULT (0) FOR \[Macdinh\]  
GO

## **\#10.**/\* Table \[dbo\].\[TPGD\]    Script Date: 15/07/2025 3:07:43 PM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[TPGD\](  
	\[MaTPGD\] \[nvarchar\](10) NOT NULL,  
	\[TPGD\] \[nvarchar\](20) NOT NULL,  
	\[TT\] \[int\] NULL,  
	\[Macdinh\] \[bit\] NOT NULL,  
 CONSTRAINT \[PK\_TPGD\] PRIMARY KEY CLUSTERED   
(  
	\[MaTPGD\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[TPGD\] ADD  CONSTRAINT \[DF\_TPGD\_Macdinh\]  DEFAULT (0) FOR \[Macdinh\]  
GO

## **\#11.**/\* Table \[dbo\].\[TruongTHPT\]    Script Date: 15/07/2025 3:08:24 PM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[TruongTHPT\](  
	\[MaTHPT\] \[nvarchar\](10) NOT NULL,  
	\[TruongTHPT\] \[nvarchar\](200) NOT NULL,  
	\[Diachi\] \[nvarchar\](200) NOT NULL,  
	\[Maso\] \[nvarchar\](10) NOT NULL,  
	\[MaKV\] \[nvarchar\](10) NULL,  
 CONSTRAINT \[PK\_\_TruongTHPT\_\_01F40C98\] PRIMARY KEY CLUSTERED   
(  
	\[MaTHPT\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

## **\#12.**/\* Table \[dbo\].\[Khuvuc\]    Script Date: 15/07/2025 2:57:10 PM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[Khuvuc\](  
	\[MaKV\] \[nvarchar\](10) NOT NULL,  
	\[Khuvuc\] \[nvarchar\](100) NOT NULL,  
	\[TT\] \[int\] NULL,  
	\[Macdinh\] \[bit\] NOT NULL,  
	\[DiemUT\] \[real\] NULL,  
 CONSTRAINT \[PK\_Khuvuc\] PRIMARY KEY CLUSTERED   
(  
	\[MaKV\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[Khuvuc\] ADD  CONSTRAINT \[DF\_Khuvuc\_Macdinh\]  DEFAULT ((0)) FOR \[Macdinh\]  
GO

## 

## \#13./\* Table \[dbo\].\[Phongthi0\]    Script Date: 13/07/2025 6:18:36 AM \*\*\*\*\*\* Thi giữa kỳ \*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[Phongthi0\](  
	\[MaPT0\] \[nvarchar\](10) NOT NULL,  
	\[Phongthi\] \[nvarchar\](50) NULL,  
	\[Ngay\] \[datetime\] NULL,  
	\[Gio\] \[int\] NULL,  
	\[Phut\] \[int\] NULL,  
	\[Thoigian\] \[int\] NULL,  
	\[Tiet\] \[int\] NULL,  
	\[Sotiet\] \[int\] NULL,  
	\[MaGV1\] \[nvarchar\](10) NULL,  
	\[MaGV2\] \[nvarchar\](10) NULL,  
	\[MaPH\] \[nvarchar\](10) NULL,  
	\[Ghichu\] \[nvarchar\](100) NULL,  
	\[MaGVCT\] \[nvarchar\](10) NULL,  
	\[MaKND\] \[int\] NULL,  
	\[MaCT\] \[nvarchar\](10) NULL,  
	\[LockND\] \[int\] NULL,  
	\[Nhapdiemtungay\] \[datetime\] NULL,  
	\[Nhapdiemdenngay\] \[datetime\] NULL,  
	\[Daxacnhan\] \[int\] NULL,  
	\[Dacongbo\] \[int\] NULL,  
	\[MaGVND\] \[nvarchar\](10) NULL,  
	\[Nopdethi\] \[int\] NULL,  
	\[Nhacnopdethi\] \[int\] NULL,  
	\[Thoigiannhacnopdethi\] \[datetime\] NULL,  
	\[Solannhacnopdethi\] \[int\] NULL,  
	\[Nopketqua\] \[int\] NULL,  
	\[Nhacnopketqua\] \[int\] NULL,  
	\[Thoigiannhacnopketqua\] \[datetime\] NULL,  
	\[Solannhacnopketqua\] \[int\] NULL,  
	\[Nhanbaithi\] \[int\] NULL,  
	\[Nhacnhanbaithi\] \[int\] NULL,  
	\[Thoigiannhacnhanbaithi\] \[datetime\] NULL,  
	\[Solannhacnhanbaithi\] \[int\] NULL,  
 CONSTRAINT \[PK\_\_Phongthi0\_\_274FAE79\] PRIMARY KEY CLUSTERED   
(  
	\[MaPT0\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[Phongthi0\] ADD  CONSTRAINT \[DF\_\_Phongthi0\_\_LockN\_\_32E15CB6\]  DEFAULT (0) FOR \[LockND\]  
GO

ALTER TABLE \[dbo\].\[Phongthi0\] ADD  CONSTRAINT \[DF\_\_Phongthi0\_\_Daxac\_\_33D580EF\]  DEFAULT (0) FOR \[Daxacnhan\]  
GO

ALTER TABLE \[dbo\].\[Phongthi0\] ADD  CONSTRAINT \[DF\_\_Phongthi0\_\_Dacon\_\_34C9A528\]  DEFAULT (0) FOR \[Dacongbo\]  
GO

ALTER TABLE \[dbo\].\[Phongthi0\] ADD  CONSTRAINT \[DF\_\_Phongthi0\_\_Nopde\_\_6C19DA12\]  DEFAULT (0) FOR \[Nopdethi\]  
GO

ALTER TABLE \[dbo\].\[Phongthi0\] ADD  CONSTRAINT \[DF\_\_Phongthi0\_\_Nhacn\_\_6E022284\]  DEFAULT (0) FOR \[Nhacnopdethi\]  
GO

ALTER TABLE \[dbo\].\[Phongthi0\] ADD  CONSTRAINT \[DF\_\_Phongthi0\_\_Solan\_\_161013DE\]  DEFAULT (0) FOR \[Solannhacnopdethi\]  
GO

ALTER TABLE \[dbo\].\[Phongthi0\] ADD  CONSTRAINT \[DF\_\_Phongthi0\_\_Nopke\_\_6D0DFE4B\]  DEFAULT (0) FOR \[Nopketqua\]  
GO

ALTER TABLE \[dbo\].\[Phongthi0\] ADD  CONSTRAINT \[DF\_\_Phongthi0\_\_Nhacn\_\_6EF646BD\]  DEFAULT (0) FOR \[Nhacnopketqua\]  
GO

ALTER TABLE \[dbo\].\[Phongthi0\] ADD  CONSTRAINT \[DF\_\_Phongthi0\_\_Solan\_\_17043817\]  DEFAULT (0) FOR \[Solannhacnopketqua\]  
GO

ALTER TABLE \[dbo\].\[Phongthi0\] ADD  CONSTRAINT \[DF\_\_Phongthi0\_\_Nhanb\_\_1333A733\]  DEFAULT (0) FOR \[Nhanbaithi\]  
GO

ALTER TABLE \[dbo\].\[Phongthi0\] ADD  CONSTRAINT \[DF\_\_Phongthi0\_\_Nhacn\_\_1427CB6C\]  DEFAULT (0) FOR \[Nhacnhanbaithi\]  
GO

ALTER TABLE \[dbo\].\[Phongthi0\] ADD  CONSTRAINT \[DF\_\_Phongthi0\_\_Solan\_\_151BEFA5\]  DEFAULT (0) FOR \[Solannhacnhanbaithi\]  
GO

ALTER TABLE \[dbo\].\[Phongthi0\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Phongthi0\_Phonghoc\] FOREIGN KEY(\[MaPH\])  
REFERENCES \[dbo\].\[Phonghoc\] (\[MaPH\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Phongthi0\] CHECK CONSTRAINT \[FK\_Phongthi0\_Phonghoc\]

## \#14**.**/\* Table \[Phongthi1\]    Script Date: 13/07/2025 6:18:36 AM \*\*\*\*\*\* Thi L1\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[Phongthi1\](  
	\[MaPT1\] \[nvarchar\](10) NOT NULL,  
	\[Phongthi\] \[nvarchar\](50) NULL,  
	\[Ngay\] \[datetime\] NULL,  
	\[Gio\] \[int\] NULL,  
	\[Phut\] \[int\] NULL,  
	\[Thoigian\] \[int\] NULL,  
	\[Tiet\] \[int\] NULL,  
	\[Sotiet\] \[int\] NULL,  
	\[MaGV1\] \[nvarchar\](10) NULL,  
	\[MaGV2\] \[nvarchar\](10) NULL,  
	\[MaPH\] \[nvarchar\](10) NULL,  
	\[Ghichu\] \[nvarchar\](100) NULL,  
	\[MaGVCT\] \[nvarchar\](10) NULL,  
	\[MaKND\] \[int\] NULL,  
	\[MaCT\] \[nvarchar\](10) NULL,  
	\[LockND\] \[int\] NULL,  
	\[Nhapdiemtungay\] \[datetime\] NULL,  
	\[Nhapdiemdenngay\] \[datetime\] NULL,  
	\[Daxacnhan\] \[int\] NULL,  
	\[Dacongbo\] \[int\] NULL,  
	\[MaGVND\] \[nvarchar\](10) NULL,  
	\[Nopdethi\] \[int\] NULL,  
	\[Nhacnopdethi\] \[int\] NULL,  
	\[Thoigiannhacnopdethi\] \[datetime\] NULL,  
	\[Solannhacnopdethi\] \[int\] NULL,  
	\[Nopketqua\] \[int\] NULL,  
	\[Nhacnopketqua\] \[int\] NULL,  
	\[Thoigiannhacnopketqua\] \[datetime\] NULL,  
	\[Solannhacnopketqua\] \[int\] NULL,  
	\[Nhanbaithi\] \[int\] NULL,  
	\[Nhacnhanbaithi\] \[int\] NULL,  
	\[Thoigiannhacnhanbaithi\] \[datetime\] NULL,  
	\[Solannhacnhanbaithi\] \[int\] NULL,  
 CONSTRAINT \[PK\_\_Phongthi1\_\_274FAE79\] PRIMARY KEY CLUSTERED   
(  
	\[MaPT1\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[Phongthi1\] ADD  CONSTRAINT \[DF\_\_Phongthi1\_\_LockN\_\_32E15CB6\]  DEFAULT (0) FOR \[LockND\]  
GO

ALTER TABLE \[dbo\].\[Phongthi1\] ADD  CONSTRAINT \[DF\_\_Phongthi1\_\_Daxac\_\_33D580EF\]  DEFAULT (0) FOR \[Daxacnhan\]  
GO

ALTER TABLE \[dbo\].\[Phongthi1\] ADD  CONSTRAINT \[DF\_\_Phongthi1\_\_Dacon\_\_34C9A528\]  DEFAULT (0) FOR \[Dacongbo\]  
GO

ALTER TABLE \[dbo\].\[Phongthi1\] ADD  CONSTRAINT \[DF\_\_Phongthi1\_\_Nopde\_\_6C19DA12\]  DEFAULT (0) FOR \[Nopdethi\]  
GO

ALTER TABLE \[dbo\].\[Phongthi1\] ADD  CONSTRAINT \[DF\_\_Phongthi1\_\_Nhacn\_\_6E022284\]  DEFAULT (0) FOR \[Nhacnopdethi\]  
GO

ALTER TABLE \[dbo\].\[Phongthi1\] ADD  CONSTRAINT \[DF\_\_Phongthi1\_\_Solan\_\_161013DE\]  DEFAULT (0) FOR \[Solannhacnopdethi\]  
GO

ALTER TABLE \[dbo\].\[Phongthi1\] ADD  CONSTRAINT \[DF\_\_Phongthi1\_\_Nopke\_\_6D0DFE4B\]  DEFAULT (0) FOR \[Nopketqua\]  
GO

ALTER TABLE \[dbo\].\[Phongthi1\] ADD  CONSTRAINT \[DF\_\_Phongthi1\_\_Nhacn\_\_6EF646BD\]  DEFAULT (0) FOR \[Nhacnopketqua\]  
GO

ALTER TABLE \[dbo\].\[Phongthi1\] ADD  CONSTRAINT \[DF\_\_Phongthi1\_\_Solan\_\_17043817\]  DEFAULT (0) FOR \[Solannhacnopketqua\]  
GO

ALTER TABLE \[dbo\].\[Phongthi1\] ADD  CONSTRAINT \[DF\_\_Phongthi1\_\_Nhanb\_\_1333A733\]  DEFAULT (0) FOR \[Nhanbaithi\]  
GO

ALTER TABLE \[dbo\].\[Phongthi1\] ADD  CONSTRAINT \[DF\_\_Phongthi1\_\_Nhacn\_\_1427CB6C\]  DEFAULT (0) FOR \[Nhacnhanbaithi\]  
GO

ALTER TABLE \[dbo\].\[Phongthi1\] ADD  CONSTRAINT \[DF\_\_Phongthi1\_\_Solan\_\_151BEFA5\]  DEFAULT (0) FOR \[Solannhacnhanbaithi\]  
GO

ALTER TABLE \[dbo\].\[Phongthi1\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Phongthi1\_Phonghoc\] FOREIGN KEY(\[MaPH\])  
REFERENCES \[dbo\].\[Phonghoc\] (\[MaPH\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Phongthi1\] CHECK CONSTRAINT \[FK\_Phongthi1\_Phonghoc\]

## \#15**.**/\* Table \[Phongthi2\]    Script Date: 13/07/2025 6:19:45 AM \*\*\*\*\*\* Thi L2\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[Phongthi2\](  
	\[MaPT2\] \[nvarchar\](10) NOT NULL,  
	\[Phongthi\] \[nvarchar\](50) NULL,  
	\[Ngay\] \[datetime\] NULL,  
	\[Gio\] \[int\] NULL,  
	\[Phut\] \[int\] NULL,  
	\[Thoigian\] \[int\] NULL,  
	\[Tiet\] \[int\] NULL,  
	\[Sotiet\] \[int\] NULL,  
	\[MaGV1\] \[nvarchar\](10) NULL,  
	\[MaGV2\] \[nvarchar\](10) NULL,  
	\[MaPH\] \[nvarchar\](10) NULL,  
	\[Ghichu\] \[nvarchar\](100) NULL,  
	\[MaGVCT\] \[nvarchar\](10) NULL,  
	\[MaKND\] \[int\] NULL,  
	\[MaCT\] \[nvarchar\](10) NULL,  
	\[LockND\] \[int\] NULL,  
	\[Nhapdiemtungay\] \[datetime\] NULL,  
	\[Nhapdiemdenngay\] \[datetime\] NULL,  
	\[Daxacnhan\] \[int\] NULL,  
	\[Dacongbo\] \[int\] NULL,  
	\[MaGVND\] \[nvarchar\](10) NULL,  
	\[Nopdethi\] \[int\] NULL,  
	\[Nhacnopdethi\] \[int\] NULL,  
	\[Thoigiannhacnopdethi\] \[datetime\] NULL,  
	\[Solannhacnopdethi\] \[int\] NULL,  
	\[Nopketqua\] \[int\] NULL,  
	\[Nhacnopketqua\] \[int\] NULL,  
	\[Thoigiannhacnopketqua\] \[datetime\] NULL,  
	\[Solannhacnopketqua\] \[int\] NULL,  
	\[Nhanbaithi\] \[int\] NULL,  
	\[Nhacnhanbaithi\] \[int\] NULL,  
	\[Thoigiannhacnhanbaithi\] \[datetime\] NULL,  
	\[Solannhacnhanbaithi\] \[int\] NULL,  
 CONSTRAINT \[PK\_\_Phongthi2\_\_2937F6EB\] PRIMARY KEY CLUSTERED   
(  
	\[MaPT2\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[Phongthi2\] ADD  CONSTRAINT \[DF\_\_Phongthi2\_\_LockN\_\_35BDC961\]  DEFAULT (0) FOR \[LockND\]  
GO

ALTER TABLE \[dbo\].\[Phongthi2\] ADD  CONSTRAINT \[DF\_\_Phongthi2\_\_Daxac\_\_36B1ED9A\]  DEFAULT (0) FOR \[Daxacnhan\]  
GO

ALTER TABLE \[dbo\].\[Phongthi2\] ADD  CONSTRAINT \[DF\_\_Phongthi2\_\_Dacon\_\_37A611D3\]  DEFAULT (0) FOR \[Dacongbo\]  
GO

ALTER TABLE \[dbo\].\[Phongthi2\] ADD  CONSTRAINT \[DF\_\_Phongthi2\_\_Nopde\_\_6FEA6AF6\]  DEFAULT (0) FOR \[Nopdethi\]  
GO

ALTER TABLE \[dbo\].\[Phongthi2\] ADD  CONSTRAINT \[DF\_\_Phongthi2\_\_Nhacn\_\_71D2B368\]  DEFAULT (0) FOR \[Nhacnopdethi\]  
GO

ALTER TABLE \[dbo\].\[Phongthi2\] ADD  CONSTRAINT \[DF\_\_Phongthi2\_\_Solan\_\_1AD4C8FB\]  DEFAULT (0) FOR \[Solannhacnopdethi\]  
GO

ALTER TABLE \[dbo\].\[Phongthi2\] ADD  CONSTRAINT \[DF\_\_Phongthi2\_\_Nopke\_\_70DE8F2F\]  DEFAULT (0) FOR \[Nopketqua\]  
GO

ALTER TABLE \[dbo\].\[Phongthi2\] ADD  CONSTRAINT \[DF\_\_Phongthi2\_\_Nhacn\_\_72C6D7A1\]  DEFAULT (0) FOR \[Nhacnopketqua\]  
GO

ALTER TABLE \[dbo\].\[Phongthi2\] ADD  CONSTRAINT \[DF\_\_Phongthi2\_\_Solan\_\_1BC8ED34\]  DEFAULT (0) FOR \[Solannhacnopketqua\]  
GO

ALTER TABLE \[dbo\].\[Phongthi2\] ADD  CONSTRAINT \[DF\_\_Phongthi2\_\_Nhanb\_\_17F85C50\]  DEFAULT (0) FOR \[Nhanbaithi\]  
GO

ALTER TABLE \[dbo\].\[Phongthi2\] ADD  CONSTRAINT \[DF\_\_Phongthi2\_\_Nhacn\_\_18EC8089\]  DEFAULT (0) FOR \[Nhacnhanbaithi\]  
GO

ALTER TABLE \[dbo\].\[Phongthi2\] ADD  CONSTRAINT \[DF\_\_Phongthi2\_\_Solan\_\_19E0A4C2\]  DEFAULT (0) FOR \[Solannhacnhanbaithi\]  
GO

ALTER TABLE \[dbo\].\[Phongthi2\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Phongthi2\_Phonghoc\] FOREIGN KEY(\[MaPH\])  
REFERENCES \[dbo\].\[Phonghoc\] (\[MaPH\])  
GO

ALTER TABLE \[dbo\].\[Phongthi2\] CHECK CONSTRAINT \[FK\_Phongthi2\_Phonghoc\]  
GO

## \#16**.**/\* Table \[Giaovien\]    Script Date: 05/07/2025 7:28:08 AM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[Giaovien\](  
	\[MaGV\] \[nvarchar\](10) NOT NULL,  
	\[Maso\] \[nvarchar\](50) NULL,  
	\[Matkhau\] \[nvarchar\](50) NULL,  
	\[TT\] \[int\] NULL,  
	\[Holot\] \[nvarchar\](100) NULL,  
	\[Ten\] \[nvarchar\](50) NULL,  
	\[Hoten\] \[nvarchar\](200) NULL,  
	\[Viettat\] \[nvarchar\](50) NULL,  
	\[Ngaysinh\] \[datetime\] NULL,  
	\[Noisinh\] \[nvarchar\](200) NULL,  
	\[Gioitinh\] \[bit\] NULL,  
	\[Nguyenquan\] \[nvarchar\](200) NULL,  
	\[Hokhau\] \[nvarchar\](200) NULL,  
	\[Diachi\] \[nvarchar\](200) NULL,  
	\[Dienthoai\] \[nvarchar\](100) NULL,  
	\[Email\] \[nvarchar\](100) NULL,  
	\[Chuyennganh\] \[nvarchar\](100) NULL,  
	\[MaDT\] \[nvarchar\](10) NULL,  
	\[MaTG\] \[nvarchar\](10) NULL,  
	\[MaHH\] \[nvarchar\](10) NULL,  
	\[MaHV\] \[nvarchar\](10) NULL,  
	\[MaDV\] \[nvarchar\](10) NULL,  
	\[MaCV\] \[nvarchar\](10) NULL,  
	\[MaDCS\] \[nvarchar\](10) NULL,  
	\[MaTPGD\] \[nvarchar\](10) NULL,  
	\[Pass\] \[nvarchar\](50) NULL,  
	\[DoanTN\] \[nvarchar\](12) NULL,  
	\[DangCS\] \[nvarchar\](12) NULL,  
	\[DangCSCT\] \[nvarchar\](50) NULL,  
	\[SoCMND\] \[nvarchar\](50) NULL,  
	\[NgaycapCMND\] \[datetime\] NULL,  
	\[NoicapCMND\] \[nvarchar\](100) NULL,  
	\[Sotaikhoan\] \[nvarchar\](200) NULL,  
	\[Khenthuong\] \[nvarchar\](50) NULL,  
	\[Hinh\_anh\] \[image\] NULL,  
	\[Ghichu\] \[nvarchar\](200) NULL,  
	\[ChangePass\] \[int\] NULL,  
	\[Coquancongtac\] \[nvarchar\](200) NULL,  
	\[Dangnhap\] \[int\] NULL,  
	\[Thongbao\] \[int\] NULL,  
	\[Nhapdiem\] \[int\] NULL,  
	\[GhichuTKGV\] \[nvarchar\](200) NULL,  
	\[MaQT\] \[nvarchar\](10) NULL,  
	**\[isAdmin\] \[int\] NULL,**  
	**\[isXepTKB\] \[int\] NULL,**  
	**\[isKhaothi\] \[int\] NULL,**  
	**\[isHssv\] \[int\] NULL,**  
	**\[isTuyensinh\] \[int\] NULL,**  
	**\[isKetoan\] \[int\] NULL,**  
	**\[isVC\] \[int\] NULL,**  
	**\[MaUser\] \[nvarchar\](10) NULL,**  
 CONSTRAINT \[PK\_Giaovien\] PRIMARY KEY CLUSTERED   
(  
	\[MaGV\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\] TEXTIMAGE\_ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[Giaovien\] ADD  CONSTRAINT \[DF\_Giaovien\_TT\]  DEFAULT (0) FOR \[TT\]  
GO

ALTER TABLE \[dbo\].\[Giaovien\] ADD  CONSTRAINT \[DF\_Giaovien\_ChangePass\]  DEFAULT (1) FOR \[ChangePass\]  
GO

ALTER TABLE \[dbo\].\[Giaovien\] ADD  DEFAULT (1) FOR \[Dangnhap\]  
GO

ALTER TABLE \[dbo\].\[Giaovien\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Giaovien\_Chinhsach\] FOREIGN KEY(\[MaDCS\])  
REFERENCES \[dbo\].\[Chinhsach\] (\[MaDCS\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Giaovien\] CHECK CONSTRAINT \[FK\_Giaovien\_Chinhsach\]  
GO

ALTER TABLE \[dbo\].\[Giaovien\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Giaovien\_Chucvu\] FOREIGN KEY(\[MaCV\])  
REFERENCES \[dbo\].\[Chucvu\] (\[MaCV\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Giaovien\] CHECK CONSTRAINT \[FK\_Giaovien\_Chucvu\]  
GO

ALTER TABLE \[dbo\].\[Giaovien\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Giaovien\_Dantoc\] FOREIGN KEY(\[MaDT\])  
REFERENCES \[dbo\].\[Dantoc\] (\[MaDT\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Giaovien\] CHECK CONSTRAINT \[FK\_Giaovien\_Dantoc\]  
GO

ALTER TABLE \[dbo\].\[Giaovien\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Giaovien\_Donvi\] FOREIGN KEY(\[MaDV\])  
REFERENCES \[dbo\].\[Donvi\] (\[MaDV\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Giaovien\] CHECK CONSTRAINT \[FK\_Giaovien\_Donvi\]  
GO

ALTER TABLE \[dbo\].\[Giaovien\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Giaovien\_Hocham\] FOREIGN KEY(\[MaHH\])  
REFERENCES \[dbo\].\[Hocham\] (\[MaHH\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Giaovien\] CHECK CONSTRAINT \[FK\_Giaovien\_Hocham\]  
GO

ALTER TABLE \[dbo\].\[Giaovien\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Giaovien\_Hocvi\] FOREIGN KEY(\[MaHV\])  
REFERENCES \[dbo\].\[Hocvi\] (\[MaHV\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Giaovien\] CHECK CONSTRAINT \[FK\_Giaovien\_Hocvi\]  
GO

ALTER TABLE \[dbo\].\[Giaovien\]  WITH CHECK ADD  CONSTRAINT \[FK\_GiaoVien\_Quoctich\] FOREIGN KEY(\[MaQT\])  
REFERENCES \[dbo\].\[Quoctich\] (\[MaQT\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Giaovien\] CHECK CONSTRAINT \[FK\_GiaoVien\_Quoctich\]  
GO

ALTER TABLE \[dbo\].\[Giaovien\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Giaovien\_TonGiao\] FOREIGN KEY(\[MaTG\])  
REFERENCES \[dbo\].\[Tongiao\] (\[MaTG\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Giaovien\] CHECK CONSTRAINT \[FK\_Giaovien\_TonGiao\]  
GO

ALTER TABLE \[dbo\].\[Giaovien\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Giaovien\_TPGD\] FOREIGN KEY(\[MaTPGD\])  
REFERENCES \[dbo\].\[TPGD\] (\[MaTPGD\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Giaovien\] CHECK CONSTRAINT \[FK\_Giaovien\_TPGD\]  
GO

## \#17**.**/\* Table \[Phonghoc\]  Script Date: 27/06/2025 10:15:39 AM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[Phonghoc\](  
	\[MaPH\] \[nvarchar\](10) NOT NULL,  
	\[Tenphong\] \[nvarchar\](50) NOT NULL,  
	\[Socho\] \[int\] NULL,  
	\[Ghichu\] \[nvarchar\](100) NULL,  
	\[MaLP\] \[nvarchar\](10) NULL,  
	\[MaNP\] \[nvarchar\](10) NULL,  
 CONSTRAINT \[PK\_Phonghoc\] PRIMARY KEY CLUSTERED   
(  
	\[MaPH\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[Phonghoc\]  WITH CHECK ADD  CONSTRAINT \[FK\_Phonghoc\_Loaiphong\] FOREIGN KEY(\[MaLP\])  
REFERENCES \[dbo\].\[Loaiphong\] (\[MaLP\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Phonghoc\] CHECK CONSTRAINT \[FK\_Phonghoc\_Loaiphong\]  
GO

ALTER TABLE \[dbo\].\[Phonghoc\]  WITH CHECK ADD  CONSTRAINT \[FK\_Phonghoc\_Nhomphong\] FOREIGN KEY(\[MaNP\])  
REFERENCES \[dbo\].\[Nhomphong\] (\[MaNP\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Phonghoc\] CHECK CONSTRAINT \[FK\_Phonghoc\_Nhomphong\]  
GO

## \#18**.**/\* Table \[**Donvi**\]    Script Date: 27/06/2025 10:16:17 AM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[Donvi\](  
	\[MaDV\] \[nvarchar\](10) NOT NULL,  
	\[Donvi\] \[nvarchar\](50) NULL,  
	\[Diachi\] \[nvarchar\](200) NULL,  
	\[Dienthoai\] \[nvarchar\](100) NULL,  
	\[MaDVcha\] \[nvarchar\](50) NULL,  
	\[MaDVgoc\] \[nvarchar\](50) NULL,  
	\[Daotao\] \[bit\] NULL,  
	\[**Viettat\] \[nvarchar\](20) NULL**  
 CONSTRAINT \[PK\_Donvi\] PRIMARY KEY CLUSTERED   
(  
	\[MaDV\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[Donvi\] ADD  CONSTRAINT \[DF\_Donvi\_Daotao\]  DEFAULT (1) FOR \[Daotao\]  
GO

## \#19**.**/\* Table \[Hocphan\]   Script Date: 27/06/2025 10:16:44 AM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[Hocphan\](  
	\[MaHP\] \[nvarchar\](10) NOT NULL,  
	\[Hocphan\] \[nvarchar\](200) NOT NULL,  
	\[Viettat\] \[nvarchar\](100) NOT NULL,  
	\[MaLoaiHP\] \[nvarchar\](10) NULL,  
	\[Maso\] \[nvarchar\](20) NULL,  
	\[HocphanEN\] \[nvarchar\](200) NULL,  
	\[ViettatEN\] \[nvarchar\](100) NULL,  
	\[HocphanVN\] \[nvarchar\](200) NULL,  
	\[ViettatVN\] \[nvarchar\](100) NULL,  
	\[MaGVs\] \[nvarchar\](500) NULL,  
	\[MaDV\] \[nvarchar\](10) NULL,  
	**\[HienthiHocphan\] \[int\] NULL,**  
 CONSTRAINT \[PK\_MonHoc\] PRIMARY KEY CLUSTERED   
(  
	\[MaHP\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[Hocphan\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Hocphan\_LoaiHocphan\] FOREIGN KEY(\[MaLoaiHP\])  
REFERENCES \[dbo\].\[LoaiHocphan\] (\[MaLoaiHP\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Hocphan\] CHECK CONSTRAINT \[FK\_Hocphan\_LoaiHocphan\]  
GO

## \#20**.**/\* Table \[Hocky\]    Script Date: 27/06/2025 10:17:22 AM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[Hocky\](  
	\[MaHK\] \[nvarchar\](10) NOT NULL,  
	\[Hocky\] \[nvarchar\](50) NULL,  
	\[Ngaybatdau\] \[datetime\] NULL,  
	\[Sotuan\] \[int\] NULL,  
	\[Ngayketthuc\] \[datetime\] NULL,  
	\[DkKehoach\_tu\] \[datetime\] NULL,  
	\[DkKehoach\_den\] \[datetime\] NULL,  
	\[DkHoclai\_tu\] \[datetime\] NULL,  
	\[DkHoclai\_den\] \[datetime\] NULL,  
	\[DkHoccaithien\_tu\] \[datetime\] NULL,  
	\[DkHoccaithien\_den\] \[datetime\] NULL,  
	\[DkTudo\_tu\] \[datetime\] NULL,  
	\[DkTudo\_den\] \[datetime\] NULL,  
	\[Dangkyhoc\] \[int\] NULL,  
	\[NgaybatdauT\] \[datetime\] NULL,  
	\[SotuanT\] \[int\] NULL,  
	\[NgayketthucT\] \[datetime\] NULL,  
	\[DkKehoach\_tuT\] \[datetime\] NULL,  
	\[DkKehoach\_denT\] \[datetime\] NULL,  
	\[DkHoclai\_tuT\] \[datetime\] NULL,  
	\[DkHoclai\_denT\] \[datetime\] NULL,  
	\[DkHoccaithien\_tuT\] \[datetime\] NULL,  
	\[DkHoccaithien\_denT\] \[datetime\] NULL,  
	\[DkTudo\_tuT\] \[datetime\] NULL,  
	\[DkTudo\_denT\] \[datetime\] NULL,  
	\[DangkyhocT\] \[int\] NULL,  
	\[NgaybatdauB\] \[datetime\] NULL,  
	\[SotuanB\] \[int\] NULL,  
	\[NgayketthucB\] \[datetime\] NULL,  
	\[DkKehoach\_tuB\] \[datetime\] NULL,  
	\[DkKehoach\_denB\] \[datetime\] NULL,  
	\[DkHoclai\_tuB\] \[datetime\] NULL,  
	\[DkHoclai\_denB\] \[datetime\] NULL,  
	\[DkHoccaithien\_tuB\] \[datetime\] NULL,  
	\[DkHoccaithien\_denB\] \[datetime\] NULL,  
	\[DkTudo\_tuB\] \[datetime\] NULL,  
	\[DkTudo\_denB\] \[datetime\] NULL,  
	\[DangkyhocB\] \[int\] NULL,  
	\[NgaybatdauM\] \[datetime\] NULL,  
	\[SotuanM\] \[int\] NULL,  
	\[NgayketthucM\] \[datetime\] NULL,  
	\[DkKehoach\_tuM\] \[datetime\] NULL,  
	\[DkKehoach\_denM\] \[datetime\] NULL,  
	\[DkHoclai\_tuM\] \[datetime\] NULL,  
	\[DkHoclai\_denM\] \[datetime\] NULL,  
	\[DkHoccaithien\_tuM\] \[datetime\] NULL,  
	\[DkHoccaithien\_denM\] \[datetime\] NULL,  
	\[DkTudo\_tuM\] \[datetime\] NULL,  
	\[DkTudo\_denM\] \[datetime\] NULL,  
	\[DangkyhocM\] \[int\] NULL,  
	\[NgaybatdauP\] \[datetime\] NULL,  
	\[SotuanP\] \[int\] NULL,  
	\[NgayketthucP\] \[datetime\] NULL,  
	\[DkKehoach\_tuP\] \[datetime\] NULL,  
	\[DkKehoach\_denP\] \[datetime\] NULL,  
	\[DkHoclai\_tuP\] \[datetime\] NULL,  
	\[DkHoclai\_denP\] \[datetime\] NULL,  
	\[DkHoccaithien\_tuP\] \[datetime\] NULL,  
	\[DkHoccaithien\_denP\] \[datetime\] NULL,  
	\[DkTudo\_tuP\] \[datetime\] NULL,  
	\[DkTudo\_denP\] \[datetime\] NULL,  
	\[DangkyhocP\] \[int\] NULL,  
	\[NgaybatdauD\] \[datetime\] NULL,  
	\[SotuanD\] \[int\] NULL,  
	\[NgayketthucD\] \[datetime\] NULL,  
	\[DkKehoach\_tuD\] \[datetime\] NULL,  
	\[DkKehoach\_denD\] \[datetime\] NULL,  
	\[DkHoclai\_tuD\] \[datetime\] NULL,  
	\[DkHoclai\_denD\] \[datetime\] NULL,  
	\[DkHoccaithien\_tuD\] \[datetime\] NULL,  
	\[DkHoccaithien\_denD\] \[datetime\] NULL,  
	\[DkTudo\_tuD\] \[datetime\] NULL,  
	\[DkTudo\_denD\] \[datetime\] NULL,  
	\[DangkyhocD\] \[int\] NULL,  
 CONSTRAINT \[PK\_Hocky\] PRIMARY KEY CLUSTERED   
(  
	\[MaHK\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[Hocky\] ADD  CONSTRAINT \[DF\_Hocky\_Dangdangky\]  DEFAULT (0) FOR \[Dangkyhoc\]  
GO

## **\#21.**/\* Table **\[Lop\]**    Script Date: 27/06/2025 10:17:57 AM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[Lop\](  
	\[MaL\] \[nvarchar\](10) NOT NULL,  
	\[Tenlop\] \[nvarchar\](50) NULL,  
	\[GVCN\] \[nvarchar\](50) NULL,  
	\[TT\] \[tinyint\] NULL,  
	\[Lock\] \[bit\] NULL,  
	\[MaNG\] \[nvarchar\](10) NULL,  
	\[Ma\_L\] \[nvarchar\](50) NULL,  
	\[MaGV\] \[nvarchar\](10) NULL,  
	\[Soluong\] \[int\] NULL,  
	\[Tuyensinh\] \[bit\] NULL,  
	\[DangkyCN\] \[int\] NULL,  
	\[DieukienTNs\] \[nvarchar\](100) NULL,  
	\[Khoahoc\] \[nvarchar\](50) NULL,  
	\[Hidden\] \[bit\] NULL,  
 CONSTRAINT \[PK\_Lop\] PRIMARY KEY CLUSTERED   
(  
	\[MaL\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[Lop\] ADD  CONSTRAINT \[DF\_Lop\_Soluong\]  DEFAULT (0) FOR \[Soluong\]  
GO

ALTER TABLE \[dbo\].\[Lop\] ADD  CONSTRAINT \[DF\_Lop\_Tuyensinh\]  DEFAULT (0) FOR \[Tuyensinh\]  
GO

ALTER TABLE \[dbo\].\[Lop\] ADD  DEFAULT (0) FOR \[DangkyCN\]  
GO

ALTER TABLE \[dbo\].\[Lop\] ADD  DEFAULT ((0)) FOR \[Hidden\]  
GO

ALTER TABLE \[dbo\].\[Lop\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Lop\_NganhHoc\] FOREIGN KEY(\[MaNG\])  
REFERENCES \[dbo\].\[Nganhhoc\] (\[MaNG\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Lop\] CHECK CONSTRAINT \[FK\_Lop\_NganhHoc\]  
GO

## \#22**.**/\* Table **\[TKB\]**    Script Date: 27/06/2025 10:19:43 AM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[TKB\](  
	\[MaLHP\] \[nvarchar\](12) NOT NULL,  
	\[Ngay\] \[datetime\] NOT NULL,  
	\[Tiet\] \[int\] NOT NULL,  
	\[MaPH\] \[nvarchar\](10) NULL,  
	\[Sotiet\] \[int\] NULL,  
	\[Buoi\] \[int\] NULL,  
	\[Ghichu\] \[nvarchar\](100) NULL,  
	\[Hieuluc\] \[bit\] NULL,  
	\[MaGV\] \[nvarchar\](10) NULL,  
            **\[LoaiLop\] \[int\] NULL,**  
 CONSTRAINT \[PK\_TKB\] PRIMARY KEY CLUSTERED   
(  
	\[MaLHP\] ASC,  
	\[Ngay\] ASC,  
	\[Tiet\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[TKB\] ADD  DEFAULT (1) FOR \[Hieuluc\]  
GO

ALTER TABLE \[dbo\].\[TKB\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_TKB\_LopHP\] FOREIGN KEY(\[MaLHP\])  
REFERENCES \[dbo\].\[LopHP\] (\[MaLHP\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[TKB\] CHECK CONSTRAINT \[FK\_TKB\_LopHP\]  
GO

ALTER TABLE \[dbo\].\[TKB\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_TKB\_Phonghoc\] FOREIGN KEY(\[MaPH\])  
REFERENCES \[dbo\].\[Phonghoc\] (\[MaPH\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[TKB\] CHECK CONSTRAINT \[FK\_TKB\_Phonghoc\]  
GO

## \#23**.**/\* Table \[Chucvu\]    Script Date: 27/06/2025 10:22:01 AM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[Chucvu\](  
	\[MaCV\] \[nvarchar\](10) NOT NULL,  
	\[Chucvu\] \[nvarchar\](100) NOT NULL,  
	\[TT\] \[int\] NULL,  
	\[Macdinh\] \[bit\] NULL,  
 CONSTRAINT \[PK\_Chucvu\] PRIMARY KEY CLUSTERED   
(  
	\[MaCV\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[Chucvu\] ADD  CONSTRAINT \[DF\_Chucvu\_TT\]  DEFAULT (0) FOR \[TT\]  
GO

ALTER TABLE \[dbo\].\[Chucvu\] ADD  CONSTRAINT \[DF\_Chucvu\_Macdinh\]  DEFAULT (0) FOR \[Macdinh\]  
GO

## \#24**.**/\* Table \[db\_LogWebapp\]    Script Date: 17/07/2025 3:08:57 PM \*\*\*\*\*\* **Phát sinh  mới \***/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[db\_LogWebapp\](  
	\[ID\] \[int\] IDENTITY(1,1) NOT NULL,  
	\[Thoigian\] \[datetime\] NULL,  
	\[MaUser\] \[nvarchar\](10) NULL,  
	\[Cuaso\] \[nvarchar\](100) NULL,  
	\[Congviec\] \[nvarchar\](200) NULL,  
	\[Ghichu\] \[nvarchar\](2000) NULL,  
 CONSTRAINT \[PK\_db\_LogWebapp\] PRIMARY KEY CLUSTERED   
(  
	\[ID\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]

## **\#25.**/\* Table **\[LopHP\]    Script Date: 27/06/2025 10:19:00 AM \*\*\*\*\*\*/**

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[LopHP\](  
	\[MaLHP\] \[nvarchar\](12) NOT NULL,  
	\[Tenlop\] \[nvarchar\](100) NULL,  
	\[MaDV\] \[nvarchar\](10) NULL,  
	\[MaLLHP\] \[nvarchar\](10) NULL,  
	\[MaHP\] \[nvarchar\](10) NULL,  
	\[MaGV\] \[nvarchar\](10) NULL,  
	\[MaHK\] \[nvarchar\](10) NULL,  
	\[MaNLHP\] \[nvarchar\](10) NULL,  
	\[Hocphi\] \[int\] NULL,  
	\[Soluong\] \[int\] NULL,  
	\[Dadangky\] \[int\] NULL,  
	\[TKB\] \[nvarchar\](300) NULL,  
	\[LockDK\] \[int\] NULL,  
	\[LockND\] \[int\] NULL,  
	\[L2\] \[bit\] NULL,  
	\[L3\] \[bit\] NULL,  
	\[MaKND\] \[int\] NULL,  
	\[MaCT1\] \[nvarchar\](10) NULL,  
	\[MaCT2\] \[nvarchar\](10) NULL,  
	\[MaCT3\] \[nvarchar\](10) NULL,  
	\[MaCT4\] \[nvarchar\](10) NULL,  
	\[Sonhom\] \[int\] NULL,  
	\[Tuantu\] \[bit\] NULL,  
	\[SoTC\] \[real\] NULL,  
	\[Tongsotiet\] \[int\] NULL,  
	\[Sotiettuan\] \[int\] NULL,  
	\[Solanmin\] \[int\] NULL,  
	\[Solanmax\] \[int\] NULL,  
	\[MaLP\] \[nvarchar\](10) NULL,  
	\[NhapdiemKiemtra\] \[bit\] NULL,  
	\[NhapdiemThiL1\] \[bit\] NULL,  
	\[NhapdiemThiL2\] \[bit\] NULL,  
	\[Nhapdiemtungay\] \[datetime\] NULL,  
	\[Nhapdiemdenngay\] \[datetime\] NULL,  
	\[Tuanhoc\] \[nvarchar\](100) NULL,  
	\[NhapdiemKiemtraL1\] \[bit\] NULL,  
	\[NhapdiemKiemtraL2\] \[bit\] NULL,  
	\[Dongia\] \[int\] NULL,  
	\[Tonghocphi\] \[int\] NULL,  
	\[Daxacnhan\] \[int\] NULL,  
	\[Dacongbo\] \[int\] NULL,  
	\[MaPDGCK\] \[nvarchar\](10) NULL,  
	\[DanhgiatungayCK\] \[datetime\] NULL,  
	\[DanhgiadenngayCK\] \[datetime\] NULL,  
	\[LockDGCK\] \[int\] NULL,  
	\[GhichuDGCK\] \[nvarchar\](200) NULL,  
	\[MaPDGGK\] \[nvarchar\](10) NULL,  
	\[DanhgiatungayGK\] \[datetime\] NULL,  
	\[DanhgiadenngayGK\] \[datetime\] NULL,  
	\[LockDGGK\] \[int\] NULL,  
	\[GhichuDGGK\] \[nvarchar\](200) NULL,  
	\[MaHPTC\] \[nvarchar\](10) NULL,  
	\[MaGVs\_Trogiang\] \[nvarchar\](200) NULL,  
	\[L4\] \[bit\] NULL,  
	\[L5\] \[bit\] NULL,  
	\[DaxacnhanL2\] \[int\] NULL,  
	\[DacongboL2\] \[int\] NULL,  
	\[Dangkyhoctungay\] \[datetime\] NULL,  
	\[Dangkyhocdenngay\] \[datetime\] NULL,  
	\[GuiFileNhapdiem\] \[bit\] NULL,  
	\[ThoigianGuiFileNhapdiem\] \[datetime\] NULL,  
	\[GDTC\] \[int\] NULL,  
	\[LockDiemdanh\] \[int\] NULL,  
	\[LockXetthi\] \[int\] NULL,  
	\[MaLs\] \[nvarchar\](500) NULL,  
	\[MaL\] \[nvarchar\](10) NULL,  
 CONSTRAINT \[PK\_LopHP\] PRIMARY KEY CLUSTERED   
(  
	\[MaLHP\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[LopHP\] ADD  CONSTRAINT \[DF\_LopHP\_Dangky\]  DEFAULT ((0)) FOR \[Dadangky\]  
GO

ALTER TABLE \[dbo\].\[LopHP\] ADD  CONSTRAINT \[DF\_LopHP\_Lock\]  DEFAULT ((0)) FOR \[LockDK\]  
GO

ALTER TABLE \[dbo\].\[LopHP\] ADD  CONSTRAINT \[DF\_LopHP\_LockND\]  DEFAULT ((0)) FOR \[LockND\]  
GO

ALTER TABLE \[dbo\].\[LopHP\] ADD  CONSTRAINT \[DF\_LopHP\_L2\]  DEFAULT ((0)) FOR \[L2\]  
GO

ALTER TABLE \[dbo\].\[LopHP\] ADD  CONSTRAINT \[DF\_LopHP\_L3\]  DEFAULT ((0)) FOR \[L3\]  
GO

ALTER TABLE \[dbo\].\[LopHP\] ADD  CONSTRAINT \[DF\_LopHP\_Tochucnhomthi\]  DEFAULT ((0)) FOR \[Sonhom\]  
GO

ALTER TABLE \[dbo\].\[LopHP\] ADD  CONSTRAINT \[DF\_LopHP\_Trenxuong\]  DEFAULT ((1)) FOR \[Tuantu\]  
GO

ALTER TABLE \[dbo\].\[LopHP\] ADD  CONSTRAINT \[DF\_LopHP\_NhapdiemKtra\]  DEFAULT ((0)) FOR \[NhapdiemKiemtra\]  
GO

ALTER TABLE \[dbo\].\[LopHP\] ADD  CONSTRAINT \[DF\_LopHP\_NhapdiemThiL1\]  DEFAULT ((0)) FOR \[NhapdiemThiL1\]  
GO

ALTER TABLE \[dbo\].\[LopHP\] ADD  CONSTRAINT \[DF\_LopHP\_NhapdiemThiL11\]  DEFAULT ((0)) FOR \[NhapdiemThiL2\]  
GO

ALTER TABLE \[dbo\].\[LopHP\] ADD  CONSTRAINT \[DF\_\_LopHP\_\_NhapdiemK\_\_14FBF414\]  DEFAULT ((0)) FOR \[NhapdiemKiemtraL1\]  
GO

ALTER TABLE \[dbo\].\[LopHP\] ADD  CONSTRAINT \[DF\_\_LopHP\_\_NhapdiemK\_\_15F0184D\]  DEFAULT ((0)) FOR \[NhapdiemKiemtraL2\]  
GO

ALTER TABLE \[dbo\].\[LopHP\] ADD  CONSTRAINT \[DF\_\_LopHP\_\_Daxacnhan\_\_30F91444\]  DEFAULT ((0)) FOR \[Daxacnhan\]  
GO

ALTER TABLE \[dbo\].\[LopHP\] ADD  CONSTRAINT \[DF\_\_LopHP\_\_Dacongbo\_\_31ED387D\]  DEFAULT ((0)) FOR \[Dacongbo\]  
GO

ALTER TABLE \[dbo\].\[LopHP\] ADD  CONSTRAINT \[DF\_\_LopHP\_\_LockDG\_\_5224FDE5\]  DEFAULT ((0)) FOR \[LockDGCK\]  
GO

ALTER TABLE \[dbo\].\[LopHP\] ADD  CONSTRAINT \[DF\_\_LopHP\_\_LockDGGK\_\_1D472152\]  DEFAULT ((0)) FOR \[LockDGGK\]  
GO

ALTER TABLE \[dbo\].\[LopHP\] ADD  CONSTRAINT \[DF\_\_LopHP\_\_L4\_\_7524215F\]  DEFAULT ((0)) FOR \[L4\]  
GO

ALTER TABLE \[dbo\].\[LopHP\] ADD  CONSTRAINT \[DF\_\_LopHP\_\_L5\_\_76184598\]  DEFAULT ((0)) FOR \[L5\]  
GO

ALTER TABLE \[dbo\].\[LopHP\] ADD  CONSTRAINT \[DF\_\_LopHP\_\_Daxacnhan\_\_28A3C565\]  DEFAULT ((0)) FOR \[DaxacnhanL2\]  
GO

ALTER TABLE \[dbo\].\[LopHP\] ADD  CONSTRAINT \[DF\_\_LopHP\_\_DacongboL\_\_2997E99E\]  DEFAULT ((0)) FOR \[DacongboL2\]  
GO

ALTER TABLE \[dbo\].\[LopHP\] ADD  CONSTRAINT \[DF\_\_LopHP\_\_GuiFileNh\_\_416F732F\]  DEFAULT ((0)) FOR \[GuiFileNhapdiem\]  
GO

ALTER TABLE \[dbo\].\[LopHP\] ADD  CONSTRAINT \[DF\_\_LopHP\_\_LockDiemd\_\_5911F296\]  DEFAULT ((0)) FOR \[LockDiemdanh\]  
GO

ALTER TABLE \[dbo\].\[LopHP\] ADD  CONSTRAINT \[DF\_\_LopHP\_\_LockXetth\_\_5A0616CF\]  DEFAULT ((0)) FOR \[LockXetthi\]  
GO

ALTER TABLE \[dbo\].\[LopHP\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_LopHP\_Congthuc\] FOREIGN KEY(\[MaCT1\])  
REFERENCES \[dbo\].\[Congthuc1\] (\[MaCT1\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[LopHP\] CHECK CONSTRAINT \[FK\_LopHP\_Congthuc\]  
GO

ALTER TABLE \[dbo\].\[LopHP\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_LopHP\_Congthuc2\] FOREIGN KEY(\[MaCT2\])  
REFERENCES \[dbo\].\[Congthuc2\] (\[MaCT2\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[LopHP\] CHECK CONSTRAINT \[FK\_LopHP\_Congthuc2\]  
GO

ALTER TABLE \[dbo\].\[LopHP\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_LopHP\_Congthuc3\] FOREIGN KEY(\[MaCT3\])  
REFERENCES \[dbo\].\[Congthuc3\] (\[MaCT3\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[LopHP\] CHECK CONSTRAINT \[FK\_LopHP\_Congthuc3\]  
GO

ALTER TABLE \[dbo\].\[LopHP\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_LopHP\_Congthuc4\] FOREIGN KEY(\[MaCT4\])  
REFERENCES \[dbo\].\[Congthuc4\] (\[MaCT4\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[LopHP\] CHECK CONSTRAINT \[FK\_LopHP\_Congthuc4\]  
GO

ALTER TABLE \[dbo\].\[LopHP\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_LopHP\_Donvi\] FOREIGN KEY(\[MaDV\])  
REFERENCES \[dbo\].\[Donvi\] (\[MaDV\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[LopHP\] CHECK CONSTRAINT \[FK\_LopHP\_Donvi\]  
GO

ALTER TABLE \[dbo\].\[LopHP\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_LopHP\_Hocphan\] FOREIGN KEY(\[MaHP\])  
REFERENCES \[dbo\].\[Hocphan\] (\[MaHP\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[LopHP\] CHECK CONSTRAINT \[FK\_LopHP\_Hocphan\]  
GO

ALTER TABLE \[dbo\].\[LopHP\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_LopHP\_HocphiTinchi\] FOREIGN KEY(\[MaHPTC\])  
REFERENCES \[dbo\].\[HocphiTinchi\] (\[MaHPTC\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[LopHP\] CHECK CONSTRAINT \[FK\_LopHP\_HocphiTinchi\]  
GO

ALTER TABLE \[dbo\].\[LopHP\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_LopHP\_LoaiLopHP\] FOREIGN KEY(\[MaLLHP\])  
REFERENCES \[dbo\].\[LoaiLopHP\] (\[MaLLHP\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[LopHP\] CHECK CONSTRAINT \[FK\_LopHP\_LoaiLopHP\]  
GO

ALTER TABLE \[dbo\].\[LopHP\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_LopHP\_Loaiphong\] FOREIGN KEY(\[MaLP\])  
REFERENCES \[dbo\].\[Loaiphong\] (\[MaLP\])  
GO

ALTER TABLE \[dbo\].\[LopHP\] CHECK CONSTRAINT \[FK\_LopHP\_Loaiphong\]  
GO

ALTER TABLE \[dbo\].\[LopHP\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_LopHP\_NhomLHP\] FOREIGN KEY(\[MaNLHP\])  
REFERENCES \[dbo\].\[NhomLHP\] (\[MaNLHP\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[LopHP\] CHECK CONSTRAINT \[FK\_LopHP\_NhomLHP\]  
GO

ALTER TABLE \[dbo\].\[LopHP\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_LopHP\_PhieuDanhgia\] FOREIGN KEY(\[MaPDGCK\])  
REFERENCES \[dbo\].\[PhieuDanhgia\] (\[MaPDG\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[LopHP\] CHECK CONSTRAINT \[FK\_LopHP\_PhieuDanhgia\]  
GO

## **\#26.**/\* Table **\[dbo\].\[Hocphi\]    Script Date: 13/07/2025 6:25:09 AM \*\*\*\*\*\*/**

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[Hocphi\](  
	\[MaSV\] \[nvarchar\](12) NOT NULL,  
	\[MaHK\] \[nvarchar\](10) NOT NULL,  
	\[MaKT\] \[nvarchar\](10) NOT NULL,  
	\[Lan\] \[int\] NOT NULL,  
	\[TT\] \[int\] NULL,  
	\[Lydo\] \[nvarchar\](500) NULL,  
	\[SoCT\] \[int\] NULL,  
	\[Thue\] \[int\] NULL,  
	\[Sotien\] \[int\] NULL,  
	\[Sotienthu\] \[int\] NULL,  
	\[Ngaynop\] \[datetime\] NULL,  
	\[MaUser\] \[nvarchar\](10) NULL,  
	\[Ghichu\] \[nvarchar\](50) NULL,  
	\[MaLPT\] \[nvarchar\](10) NULL,  
	\[IDDST\] \[int\] NULL,  
	\[Hinhthucthanhtoan\] \[nvarchar\](100) NULL,  
	\[Lanthi\] \[int\] NULL,  
	\[ID\] \[int\] IDENTITY(1,1) NOT NULL,  
	\[MaKT01\] \[nvarchar\](10) NULL,  
	\[Sotienthu01\] \[int\] NULL,  
	\[MaKT02\] \[nvarchar\](10) NULL,  
	\[Sotienthu02\] \[int\] NULL,  
	\[MaKT03\] \[nvarchar\](10) NULL,  
	\[Sotienthu03\] \[int\] NULL,  
	\[MaKT04\] \[nvarchar\](10) NULL,  
	\[Sotienthu04\] \[int\] NULL,  
	\[MaKT05\] \[nvarchar\](10) NULL,  
	\[Sotienthu05\] \[int\] NULL,  
	\[Hoclai\] \[int\] NULL,  
 CONSTRAINT \[PK\_Hocphi\] PRIMARY KEY CLUSTERED   
(  
	\[MaSV\] ASC,  
	\[MaHK\] ASC,  
	\[MaKT\] ASC,  
	\[Lan\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[Hocphi\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Hocphi\_Loaiphieuthu\] FOREIGN KEY(\[MaLPT\])  
REFERENCES \[dbo\].\[Loaiphieuthu\] (\[MaLPT\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Hocphi\] CHECK CONSTRAINT \[FK\_Hocphi\_Loaiphieuthu\]  
GO

ALTER TABLE \[dbo\].\[Hocphi\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Hocphi\_Sinhvien\] FOREIGN KEY(\[MaSV\])  
REFERENCES \[dbo\].\[Sinhvien\] (\[MaSV\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Hocphi\] CHECK CONSTRAINT \[FK\_Hocphi\_Sinhvien\]  
GO

ALTER TABLE \[dbo\].\[Hocphi\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Hocphi\_Users\] FOREIGN KEY(\[MaUser\])  
REFERENCES \[dbo\].\[Users\] (\[MaUser\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Hocphi\] CHECK CONSTRAINT \[FK\_Hocphi\_Users\]  
GO

## **\#27.**/\* Table **\[dbo\].\[Loaiphieuthu\]    Script Date: 13/07/2025 6:27:13 AM \*\*\*\*\*\*/**

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[Loaiphieuthu\](  
	\[MaLPT\] \[nvarchar\](10) NOT NULL,  
	\[Loaiphieuthu\] \[nvarchar\](100) NOT NULL,  
	\[Ghichu\] \[nvarchar\](100) NULL,  
 CONSTRAINT \[PK\_Loaiphieuthu\] PRIMARY KEY CLUSTERED   
(  
	\[MaLPT\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

## **\#28.**/\* Table **\[dbo\].\[Sinhvien\]    Script Date: 13/07/2025 6:29:18 AM \*\*\*\*\*\*/**

**SET ANSI\_NULLS ON**  
**GO**

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[Sinhvien\](  
	\[MaSV\] \[nvarchar\](12) NOT NULL,  
	\[Maso\] \[nvarchar\](50) NULL,  
	\[Matkhau\] \[nvarchar\](50) NULL,  
	\[TT\] \[int\] NULL,  
	\[Holot\] \[nvarchar\](50) NULL,  
	\[Ten\] \[nvarchar\](20) NULL,  
	\[Tenthuonggoi\] \[nvarchar\](50) NULL,  
	\[Ngaysinh1\] \[nvarchar\](12) NULL,  
	\[Ngaysinh\] \[datetime\] NULL,  
	\[Noisinh\] \[nvarchar\](250) NULL,  
	\[Gioitinh\] \[bit\] NULL,  
	\[Hokhau\] \[nvarchar\](250) NULL,  
	\[Nguyenquan\] \[nvarchar\](250) NULL,  
	\[MaHKdau\] \[nvarchar\](10) NULL,  
	\[Diachi\] \[nvarchar\](250) NULL,  
	\[Dienthoai\] \[nvarchar\](250) NULL,  
	\[MaDT\] \[nvarchar\](10) NULL,  
	\[MaTG\] \[nvarchar\](10) NULL,  
	\[MaDTCS\] \[nvarchar\](10) NULL,  
	\[MaKV\] \[nvarchar\](10) NULL,  
	\[MaDCS\] \[nvarchar\](10) NULL,  
	\[MaTPGD\] \[nvarchar\](10) NULL,  
	\[MaDD\] \[nvarchar\](10) NULL,  
	\[MaL\] \[nvarchar\](10) NULL,  
	\[NgayDoanTN\] \[nvarchar\](12) NULL,  
	\[NgayDangCS\] \[nvarchar\](12) NULL,  
	\[NgayDangCSCT\] \[nvarchar\](50) NULL,  
	\[Tuoidoi\] \[int\] NULL,  
	\[Tuoidang\] \[int\] NULL,  
	\[Tuoidoan\] \[int\] NULL,  
	\[SoCMND\] \[nvarchar\](50) NULL,  
	\[NgaycapCMND\] \[datetime\] NULL,  
	\[NoicapCMND\] \[nvarchar\](100) NULL,  
	\[Khenthuong\] \[nvarchar\](50) NULL,  
	\[Sotaikhoan\] \[nvarchar\](200) NULL,  
	\[Ghichu\] \[nvarchar\](300) NULL,  
	\[Khoi\] \[nvarchar\](5) NULL,  
	\[SBDThiDH\] \[nvarchar\](10) NULL,  
	\[Mon1\] \[real\] NULL,  
	\[Mon2\] \[real\] NULL,  
	\[Mon3\] \[real\] NULL,  
	\[Tong\] \[real\] NULL,  
	\[Thuong\] \[real\] NULL,  
	\[DiemUt\] \[real\] NULL,  
	\[TrinhdoVH\] \[nvarchar\](30) NULL,  
	\[Hinh\_anh\] \[image\] NULL,  
	\[DiachiNoitru\] \[nvarchar\](250) NULL,  
	\[DiachiNgoaitru\] \[nvarchar\](250) NULL,  
	\[Ngaytamtru\] \[datetime\] NULL,  
	\[Hinhthuctamtru\] \[nvarchar\](50) NULL,  
	\[Diachitamtru\] \[nvarchar\](250) NULL,  
	\[Dienthoaitamtru\] \[nvarchar\](250) NULL,  
	\[Chunhatamtru\] \[nvarchar\](250) NULL,  
	\[Ghichutamtru\] \[nvarchar\](250) NULL,  
	\[HotenBo\] \[nvarchar\](200) NULL,  
	\[NghenghiepBo\] \[nvarchar\](200) NULL,  
	\[GhichuBo\] \[nvarchar\](200) NULL,  
	\[HotenMe\] \[nvarchar\](200) NULL,  
	\[NghenghiepMe\] \[nvarchar\](200) NULL,  
	\[GhichuMe\] \[nvarchar\](200) NULL,  
	\[Sovaoso\] \[nvarchar\](50) NULL,  
	\[Sohieu\] \[nvarchar\](50) NULL,  
	\[Nguoiky\] \[nvarchar\](100) NULL,  
	\[Ngayky\] \[datetime\] NULL,  
	\[QD\] \[nvarchar\](50) NULL,  
	\[NgaykyQD\] \[datetime\] NULL,  
	\[NguoikyQD\] \[nvarchar\](50) NULL,  
	\[Noilamviec\] \[nvarchar\](250) NULL,  
	\[Nhanxet\] \[nvarchar\](200) NULL,  
	\[Nguyenvong\] \[nvarchar\](200) NULL,  
	\[DTBTL\] \[real\] NULL,  
	\[DTBTLBon\] \[real\] NULL,  
	\[SotinchiTL\] \[real\] NULL,  
	\[DiemRLTL\] \[real\] NULL,  
	\[GhichuHV\] \[nvarchar\](200) NULL,  
	\[Totnghiep\] \[int\] NULL,  
	\[Hangtotnghiep\] \[nvarchar\](50) NULL,  
	\[ChangePass\] \[int\] NULL,  
	\[Email\] \[nvarchar\](200) NULL,  
	\[Fld01\] \[nvarchar\](250) NULL,  
	\[Fld02\] \[datetime\] NULL,  
	\[Fld03\] \[int\] NULL,  
	\[Fld04\] \[bit\] NULL,  
	\[Tinhtrang\] \[int\] NULL,  
	\[MaCNG\] \[nvarchar\](10) NULL,  
	\[TrinhdoNN\] \[nvarchar\](50) NULL,  
	\[Coquancongtac\] \[nvarchar\](200) NULL,  
	\[Chucvucongtac\] \[nvarchar\](100) NULL,  
	\[TruongdaotaoDH\] \[nvarchar\](200) NULL,  
	\[NganhdaotaoDH\] \[nvarchar\](100) NULL,  
	\[HedaotaoDH\] \[nvarchar\](100) NULL,  
	\[NamtotnghiepDH\] \[nvarchar\](50) NULL,  
	\[XeploaitotnghiepDH\] \[nvarchar\](50) NULL,  
	\[Fld05\] \[nvarchar\](250) NULL,  
	\[Fld06\] \[bit\] NULL,  
	\[QDTrungtuyen\] \[nvarchar\](200) NULL,  
	\[QDDetai\] \[nvarchar\](200) NULL,  
	\[NgayQDDetai\] \[datetime\] NULL,  
	\[TenDetai\] \[nvarchar\](500) NULL,  
	\[TenDetaiEN\] \[nvarchar\](500) NULL,  
	\[MaGVHD\] \[nvarchar\](10) NULL,  
	\[GhichuDetai\] \[nvarchar\](200) NULL,  
	\[BaoveLV\] \[int\] NULL,  
	\[GhichuBaoveLV\] \[nvarchar\](200) NULL,  
	\[MaQT\] \[nvarchar\](10) NULL,  
	\[MaHKTN\] \[nvarchar\](10) NULL,  
	\[MaQDTN\] \[nvarchar\](10) NULL,  
	\[GhichuDSTN\] \[nvarchar\](200) NULL,  
	\[Chuyennganh\] \[nvarchar\](200) NULL,  
	\[Dangnhap\] \[int\] NULL,  
	\[DkKehoach\] \[int\] NULL,  
	\[DkHoclai\] \[int\] NULL,  
	\[DkHoccaithien\] \[int\] NULL,  
	\[DkTudo\] \[int\] NULL,  
	\[GhichuTKSV\] \[nvarchar\](200) NULL,  
	\[Noibo\] \[bit\] NULL,  
	\[Fld07\] \[nvarchar\](250) NULL,  
	\[Fld08\] \[bit\] NULL,  
	\[Fld09\] \[bit\] NULL,  
	\[GhichuDieukienTN\] \[nvarchar\](200) NULL,  
	\[HabacTN\] \[nvarchar\](200) NULL,  
	\[KLTN\] \[bit\] NULL,  
	\[GhichuKLTNXet\] \[nvarchar\](200) NULL,  
	\[GhichuKLTNDetai\] \[nvarchar\](200) NULL,  
	\[MaSVgoc\] \[nvarchar\](12) NOT NULL,  
	\[MaTS\] \[nvarchar\](12) NULL,  
	\[GhichuDangkyCN\] \[nvarchar\](200) NULL,  
	\[TruongdaotaoTHS\] \[nvarchar\](200) NULL,  
	\[NganhdaotaoTHS\] \[nvarchar\](100) NULL,  
	\[HedaotaoTHS\] \[nvarchar\](100) NULL,  
	\[NamtotnghiepTHS\] \[nvarchar\](50) NULL,  
	\[XeploaitotnghiepTHS\] \[nvarchar\](50) NULL,  
	\[MaTSXT\] \[nvarchar\](12) NULL,  
	\[Fld10\] \[nvarchar\](250) NULL,  
	\[MaGVHD2\] \[nvarchar\](10) NULL,  
	\[BaoveLA\] \[int\] NULL,  
	\[GhichuBaoveLA\] \[nvarchar\](200) NULL,  
	\[Fld11\] \[nvarchar\](10) NULL,  
	\[XeploaiTL\] \[nvarchar\](50) NULL,  
	\[SoHPThilai\] \[int\] NULL,  
	\[SolanKLHabacXL\] \[int\] NULL,  
	\[GhichuTKTK\] \[nvarchar\](200) NULL,  
	\[DTB\] \[real\] NULL,  
	\[DTBBon\] \[real\] NULL,  
	\[Xeploai\] \[nvarchar\](50) NULL,  
	\[Miengiam\] \[real\] NULL,  
	\[Hocphithang\] \[int\] NULL,  
 CONSTRAINT \[PK\_SinhVien\] PRIMARY KEY CLUSTERED   
(  
	\[MaSV\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\] TEXTIMAGE\_ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[Sinhvien\] ADD  CONSTRAINT \[DF\_Sinhvien\_Totnghiep\]  DEFAULT (0) FOR \[Totnghiep\]  
GO

ALTER TABLE \[dbo\].\[Sinhvien\] ADD  CONSTRAINT \[DF\_Sinhvien\_ChangePass\]  DEFAULT (1) FOR \[ChangePass\]n  
GO

ALTER TABLE \[dbo\].\[Sinhvien\] ADD  CONSTRAINT \[DF\_\_Sinhvien\_\_Tinhtr\_\_16E43C86\]  DEFAULT (0) FOR \[Tinhtrang\]  
GO

ALTER TABLE \[dbo\].\[Sinhvien\] ADD  CONSTRAINT \[DF\_\_Sinhvien\_\_BaoveL\_\_0D25C822\]  DEFAULT (0) FOR \[BaoveLV\]  
GO

ALTER TABLE \[dbo\].\[Sinhvien\] ADD  CONSTRAINT \[DF\_\_Sinhvien\_\_Dangnh\_\_456A2145\]  DEFAULT (1) FOR \[Dangnhap\]  
GO

ALTER TABLE \[dbo\].\[Sinhvien\] ADD  DEFAULT (0) FOR \[KLTN\]  
GO

ALTER TABLE \[dbo\].\[Sinhvien\] ADD  DEFAULT ((0)) FOR \[BaoveLA\]  
GO

ALTER TABLE \[dbo\].\[Sinhvien\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Sinhvien\_Chinhsach\] FOREIGN KEY(\[MaDCS\])  
REFERENCES \[dbo\].\[Chinhsach\] (\[MaDCS\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Sinhvien\] CHECK CONSTRAINT \[FK\_Sinhvien\_Chinhsach\]  
GO

ALTER TABLE \[dbo\].\[Sinhvien\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Sinhvien\_Dantoc\] FOREIGN KEY(\[MaDT\])  
REFERENCES \[dbo\].\[Dantoc\] (\[MaDT\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Sinhvien\] CHECK CONSTRAINT \[FK\_Sinhvien\_Dantoc\]  
GO

ALTER TABLE \[dbo\].\[Sinhvien\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Sinhvien\_DTCS\] FOREIGN KEY(\[MaDTCS\])  
REFERENCES \[dbo\].\[DTCS\] (\[MaDTCS\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Sinhvien\] CHECK CONSTRAINT \[FK\_Sinhvien\_DTCS\]  
GO

ALTER TABLE \[dbo\].\[Sinhvien\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Sinhvien\_Khuvuc\] FOREIGN KEY(\[MaKV\])  
REFERENCES \[dbo\].\[Khuvuc\] (\[MaKV\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Sinhvien\] CHECK CONSTRAINT \[FK\_Sinhvien\_Khuvuc\]  
GO

ALTER TABLE \[dbo\].\[Sinhvien\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_SinhVien\_Lop\] FOREIGN KEY(\[MaL\])  
REFERENCES \[dbo\].\[Lop\] (\[MaL\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Sinhvien\] CHECK CONSTRAINT \[FK\_SinhVien\_Lop\]  
GO

ALTER TABLE \[dbo\].\[Sinhvien\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_SinhVien\_Quoctich\] FOREIGN KEY(\[MaQT\])  
REFERENCES \[dbo\].\[Quoctich\] (\[MaQT\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Sinhvien\] CHECK CONSTRAINT \[FK\_SinhVien\_Quoctich\]  
GO

ALTER TABLE \[dbo\].\[Sinhvien\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_SinhVien\_QuyetdinhTN\] FOREIGN KEY(\[MaQDTN\])  
REFERENCES \[dbo\].\[QuyetdinhTN\] (\[MaQDTN\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Sinhvien\] CHECK CONSTRAINT \[FK\_SinhVien\_QuyetdinhTN\]  
GO

ALTER TABLE \[dbo\].\[Sinhvien\]  WITH CHECK ADD  CONSTRAINT \[FK\_Sinhvien\_Tbl01\] FOREIGN KEY(\[Fld11\])  
REFERENCES \[dbo\].\[Tbl01\] (\[PKTbl01\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Sinhvien\] CHECK CONSTRAINT \[FK\_Sinhvien\_Tbl01\]  
GO

ALTER TABLE \[dbo\].\[Sinhvien\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Sinhvien\_TonGiao\] FOREIGN KEY(\[MaTG\])  
REFERENCES \[dbo\].\[Tongiao\] (\[MaTG\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Sinhvien\] CHECK CONSTRAINT \[FK\_Sinhvien\_TonGiao\]  
GO

ALTER TABLE \[dbo\].\[Sinhvien\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Sinhvien\_TPGD\] FOREIGN KEY(\[MaTPGD\])  
REFERENCES \[dbo\].\[TPGD\] (\[MaTPGD\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Sinhvien\] CHECK CONSTRAINT \[FK\_Sinhvien\_TPGD\]  
GO

## **\#29.**/\* Table **\[dbo\].\[Khoanthu\]    Script Date: 13/07/2025 6:33:14 AM \*\*\*\*\*\*/**

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[Khoanthu\](  
	\[MaKT\] \[nvarchar\](10) NOT NULL,  
	\[Khoanthu\] \[nvarchar\](200) NOT NULL,  
	\[Lydo\] \[nvarchar\](200) NOT NULL,  
	\[NoDelete\] \[int\] NULL,  
 CONSTRAINT \[PK\_Khoanthu\] PRIMARY KEY CLUSTERED   
(  
	\[MaKT\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[Khoanthu\] ADD  CONSTRAINT \[DF\_Khoanthu\_NoDelete\]  DEFAULT (0) FOR \[NoDelete\]

## **\#30.**/\* Table **\[SinhvienLopHP\]    Script Date: 17/07/2025 3:06:47 PM \*\*\*\*\*\* *Chứa điểm Thi và điểm đã tính toán hoàn chỉnh\**/**

**SET ANSI\_NULLS ON**  
**GO**

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[SinhvienLopHP\](  
	\[MaSV\] \[nvarchar\](12) NOT NULL,  
	\[MaLHP\] \[nvarchar\](12) NOT NULL,  
	\[MaCVSV\] \[nvarchar\](10) NULL,  
	\[TT\] \[int\] NULL,  
	\[Thoidiem\] \[datetime\] NULL,  
	\[Dangkymoi\] \[bit\] NULL,  
	\[CT1\] \[real\] NULL,  
	\[CT2\] \[real\] NULL,  
	\[DHP1\] \[real\] NULL,  
	\[DHP1Bon\] \[real\] NULL,  
	\[DHP1Chu\] \[nvarchar\](10) NULL,  
	\[DHP1Tram\] \[real\] NULL,  
	\[DHP1TramChu\] \[nvarchar\](10) NULL,  
	\[DHP2\] \[real\] NULL,  
	\[DHP2Bon\] \[real\] NULL,  
	\[DHP2Chu\] \[nvarchar\](10) NULL,  
	\[DHP2Tram\] \[real\] NULL,  
	\[DHP2TramChu\] \[nvarchar\](10) NULL,  
	\[DHP\] \[real\] NULL,  
	\[DHPBon\] \[real\] NULL,  
	\[DHPChu\] \[nvarchar\](10) NULL,  
	\[DHPTram\] \[real\] NULL,  
	\[DHPTramChu\] \[nvarchar\](10) NULL,  
	\[Chon\] \[bit\] NULL,  
	\[Hocphi\] \[int\] NULL,  
	\[HocphiMiengiam\] \[int\] NULL,  
	\[HocphiPhainop\] \[int\] NULL,  
	\[HocphiDanop\] \[int\] NULL,  
	\[HocphiConlai\] \[int\] NULL,  
	\[Nhom\] \[int\] NULL,  
	\[TTHP\] \[int\] NULL,  
	\[Sotietnghi\] \[int\] NULL,  
	\[ThiL0\] \[bit\] NULL,  
	\[ThiL1\] \[bit\] NULL,  
	\[ThiL2\] \[bit\] NULL,  
	\[GhichuXetThi\] \[nvarchar\](200) NULL,  
	\[MaPT0\] \[nvarchar\](10) NULL,  
	\[MaPT1\] \[nvarchar\](10) NULL,  
	\[MaPT2\] \[nvarchar\](10) NULL,  
	\[TTPT0\] \[int\] NULL,  
	\[TTPT1\] \[int\] NULL,  
	\[TTPT2\] \[int\] NULL,  
	\[Hoanthi\] \[bit\] NULL,  
	\[ThoihanHoanthi\] \[datetime\] NULL,  
	\[LydoHoanthi\] \[nvarchar\](200) NULL,  
	\[Dangkythi\] \[bit\] NULL,  
	\[GhichuDangkythi\] \[nvarchar\](200) NULL,  
	\[DaThiL0\] \[bit\] NULL,  
	\[DaThiL1\] \[bit\] NULL,  
	\[DaThiL2\] \[bit\] NULL,  
	\[QuahanHoanthi\] \[bit\] NULL,  
	\[Thongbaodiem\] \[bit\] NULL,  
	\[ThoigianThongbaodiem\] \[datetime\] NULL,  
	\[DadanhgiaCK\] \[bit\] NULL,  
	\[DadanhgiaGK\] \[bit\] NULL,  
	\[SBD0\] \[int\] NULL,  
	\[SBD1\] \[int\] NULL,  
	\[SBD2\] \[int\] NULL,  
	\[MaTT0\] \[nvarchar\](10) NULL,  
	\[MaTT1\] \[nvarchar\](10) NULL,  
	\[MaTT2\] \[nvarchar\](10) NULL,  
	\[TTTT0\] \[int\] NULL,  
	\[TTTT1\] \[int\] NULL,  
	\[TTTT2\] \[int\] NULL,  
	\[SP0\] \[int\] NULL,  
	\[SP1\] \[int\] NULL,  
	\[SP2\] \[int\] NULL,  
	\[Miengiam\] \[real\] NULL,  
	\[GhichuMiengiam\] \[nvarchar\](200) NULL,  
	\[CT3\] \[real\] NULL,  
	\[DHP3\] \[real\] NULL,  
	\[DHP3Bon\] \[real\] NULL,  
	\[DHP3Chu\] \[nvarchar\](10) NULL,  
	\[CT4\] \[real\] NULL,  
	\[DHP4\] \[real\] NULL,  
	\[DHP4Bon\] \[real\] NULL,  
	\[DHP4Chu\] \[nvarchar\](10) NULL,  
	\[CT5\] \[real\] NULL,  
	\[DHP5\] \[real\] NULL,  
	\[DHP5Bon\] \[real\] NULL,  
	\[DHP5Chu\] \[nvarchar\](10) NULL,  
 CONSTRAINT \[PK\_KetquaLopHP\] PRIMARY KEY CLUSTERED   
(  
	\[MaSV\] ASC,  
	\[MaLHP\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\] ADD  CONSTRAINT \[DF\_SinhvienLopHP\_TT\]  DEFAULT (0) FOR \[TT\]  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\] ADD  CONSTRAINT \[DF\_KetquaLopHP\_Chon\]  DEFAULT (0) FOR \[Chon\]  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\] ADD  CONSTRAINT \[DF\_SinhvienLopHP\_Miengiam\]  DEFAULT (0) FOR \[HocphiMiengiam\]  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\] ADD  CONSTRAINT \[DF\_SinhvienLopHP\_Hocphi\]  DEFAULT (0) FOR \[HocphiPhainop\]  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\] ADD  CONSTRAINT \[DF\_SinhvienLopHP\_HocphiDanop\]  DEFAULT (0) FOR \[HocphiDanop\]  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\] ADD  CONSTRAINT \[DF\_SinhvienLopHP\_HocphiConlai\]  DEFAULT (0) FOR \[HocphiConlai\]  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\] ADD  CONSTRAINT \[DF\_\_SinhvienL\_\_ThiL0\_\_65F6EC68\]  DEFAULT (0) FOR \[ThiL0\]  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\] ADD  CONSTRAINT \[DF\_\_SinhvienL\_\_ThiL1\_\_06E2DEE7\]  DEFAULT (0) FOR \[ThiL1\]  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\] ADD  CONSTRAINT \[DF\_\_SinhvienL\_\_ThiL2\_\_07D70320\]  DEFAULT (0) FOR \[ThiL2\]  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\] ADD  CONSTRAINT \[DF\_\_SinhvienL\_\_Hoant\_\_57BDDBAA\]  DEFAULT (0) FOR \[Hoanthi\]  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\] ADD  CONSTRAINT \[DF\_\_SinhvienL\_\_Dangk\_\_58B1FFE3\]  DEFAULT (0) FOR \[Dangkythi\]  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\] ADD  CONSTRAINT \[DF\_\_SinhvienL\_\_DaThi\_\_7FB6BE6B\]  DEFAULT (0) FOR \[DaThiL0\]  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\] ADD  CONSTRAINT \[DF\_\_SinhvienL\_\_DaThi\_\_59A6241C\]  DEFAULT (0) FOR \[DaThiL1\]  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\] ADD  CONSTRAINT \[DF\_\_SinhvienL\_\_DaThi\_\_5A9A4855\]  DEFAULT (0) FOR \[DaThiL2\]  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\] ADD  CONSTRAINT \[DF\_\_SinhvienL\_\_Quaha\_\_5B8E6C8E\]  DEFAULT (0) FOR \[QuahanHoanthi\]  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\] ADD  CONSTRAINT \[DF\_\_SinhvienL\_\_Thong\_\_41EE961C\]  DEFAULT (0) FOR \[Thongbaodiem\]  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\] ADD  CONSTRAINT \[DF\_\_SinhvienL\_\_Dadan\_\_540D4657\]  DEFAULT (0) FOR \[DadanhgiaCK\]  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\] ADD  CONSTRAINT \[DF\_\_SinhvienL\_\_Dadan\_\_1E3B458B\]  DEFAULT (0) FOR \[DadanhgiaGK\]  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_KetquaLopHP\_SinhVien\] FOREIGN KEY(\[MaSV\])  
REFERENCES \[dbo\].\[Sinhvien\] (\[MaSV\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\] CHECK CONSTRAINT \[FK\_KetquaLopHP\_SinhVien\]  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_SinhvienLopHP\_ChucvuSV\] FOREIGN KEY(\[MaCVSV\])  
REFERENCES \[dbo\].\[ChucvuSV\] (\[MaCVSV\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\] CHECK CONSTRAINT \[FK\_SinhvienLopHP\_ChucvuSV\]  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_SinhvienLopHP\_LopHP\] FOREIGN KEY(\[MaLHP\])  
REFERENCES \[dbo\].\[LopHP\] (\[MaLHP\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\] CHECK CONSTRAINT \[FK\_SinhvienLopHP\_LopHP\]  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_SinhvienLopHP\_Phongthi1\] FOREIGN KEY(\[MaPT1\])  
REFERENCES \[dbo\].\[Phongthi1\] (\[MaPT1\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\] CHECK CONSTRAINT \[FK\_SinhvienLopHP\_Phongthi1\]  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_SinhvienLopHP\_Phongthi2\] FOREIGN KEY(\[MaPT2\])  
REFERENCES \[dbo\].\[Phongthi2\] (\[MaPT2\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\] CHECK CONSTRAINT \[FK\_SinhvienLopHP\_Phongthi2\]  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_SinhvienLopHP\_Tuithi0\] FOREIGN KEY(\[MaTT0\])  
REFERENCES \[dbo\].\[Tuithi0\] (\[MaTT0\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\] CHECK CONSTRAINT \[FK\_SinhvienLopHP\_Tuithi0\]  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_SinhvienLopHP\_Tuithi1\] FOREIGN KEY(\[MaTT1\])  
REFERENCES \[dbo\].\[Tuithi1\] (\[MaTT1\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\] CHECK CONSTRAINT \[FK\_SinhvienLopHP\_Tuithi1\]  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_SinhvienLopHP\_Tuithi2\] FOREIGN KEY(\[MaTT2\])  
REFERENCES \[dbo\].\[Tuithi2\] (\[MaTT2\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[SinhvienLopHP\] CHECK CONSTRAINT \[FK\_SinhvienLopHP\_Tuithi2\]  
GO

## **\#31.**/\* Table **\[dbo\].\[db\_HocphiLopHocky\]    Script Date: 18/08/2025 8:10:43 AM \*\*\*\*\*\*Phát sinh  mới \*/**

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[db\_HocphiLopHocky\](  
	\[MaL\] \[nvarchar\](10) NOT NULL,  
	\[MaHK\] \[nvarchar\](10) NOT NULL,  
	\[HocphiThang\] \[int\] NULL,  
	\[MaKT\] \[nvarchar\](50) NULL,  
 CONSTRAINT \[PK\_db\_HocphiLopHocky\] PRIMARY KEY CLUSTERED   
(  
	\[MaL\] ASC,  
	\[MaHK\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[db\_HocphiLopHocky\]  WITH CHECK ADD  CONSTRAINT \[FK\_db\_HocphiLopHocky\_Hocky\] FOREIGN KEY(\[MaHK\])  
REFERENCES \[dbo\].\[Hocky\] (\[MaHK\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[db\_HocphiLopHocky\] CHECK CONSTRAINT \[FK\_db\_HocphiLopHocky\_Hocky\]  
GO

ALTER TABLE \[dbo\].\[db\_HocphiLopHocky\]  WITH CHECK ADD  CONSTRAINT \[FK\_db\_HocphiLopHocky\_Lop\] FOREIGN KEY(\[MaL\])  
REFERENCES \[dbo\].\[Lop\] (\[MaL\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[db\_HocphiLopHocky\] CHECK CONSTRAINT \[FK\_db\_HocphiLopHocky\_Lop\]  
GO

## **\#32.**/\* Table **\[dbo\].\[KhoanthuHK\]    Script Date: 15/07/2025 3:02:23 PM \*\*\*\*\*\*/**

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[KhoanthuHK\](  
	\[MaKT\] \[nvarchar\](50) NOT NULL,  
	\[Khoanthu\] \[nvarchar\](200) NOT NULL,  
	\[Lydo\] \[nvarchar\](200) NOT NULL,  
	\[NoDelete\] \[int\] NULL,  
 CONSTRAINT \[PK\_KhoanthuHP\] PRIMARY KEY CLUSTERED   
(  
	\[MaKT\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[KhoanthuHK\] ADD  CONSTRAINT \[DF\_KhoanthuHP\_NoDelete\]  DEFAULT (0) FOR \[NoDelete\]  
GO

## **\#33.**/\* Table **\[ChucvuSV\]    Script Date: 03/09/2025 3:00:59 PM \*\*\*\*\*\*/**

**SET ANSI\_NULLS ON**  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[ChucvuSV\](  
	\[MaCVSV\] \[nvarchar\](10) NOT NULL,  
	\[ChucvuSV\] \[nvarchar\](100) NOT NULL,  
	\[TT\] \[int\] NULL,  
	\[Macdinh\] \[bit\] NULL,  
 CONSTRAINT \[PK\_ChucvuSV\] PRIMARY KEY CLUSTERED   
(  
	\[MaCVSV\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[ChucvuSV\] ADD  CONSTRAINT \[DF\_ChucvuSV\_TT\]  DEFAULT (0) FOR \[TT\]  
GO

ALTER TABLE \[dbo\].\[ChucvuSV\] ADD  CONSTRAINT \[DF\_ChucvuSV\_Macdinh\]  DEFAULT (0) FOR \[Macdinh\]  
GO

## **\#34.**/\* Table **\[Congthuc2\]    Script Date: 03/09/2025 3:04:49 PM \*\*\*\*\*\*/**

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[Congthuc2\](  
	\[MaCT2\] \[nvarchar\](10) NOT NULL,  
	\[Congthuc\] \[nvarchar\](100) NOT NULL,  
	\[TT\] \[int\] NULL,  
 CONSTRAINT \[PK\_Congthuc2\] PRIMARY KEY CLUSTERED   
(  
	\[MaCT2\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

## **\#35.**/\* Table **\[Congthuc2CT\]    Script Date: 03/09/2025 3:05:15 PM \*\*\*\*\*\*/**

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[Congthuc2CT\](  
	\[MaCT2\] \[nvarchar\](10) NOT NULL,  
	\[Hs1\] \[int\] NULL,  
	\[Hs2\] \[int\] NULL,  
	\[Hs3\] \[int\] NULL,  
 CONSTRAINT \[PK\_Congthuc2CT\] PRIMARY KEY CLUSTERED   
(  
	\[MaCT2\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[Congthuc2CT\] ADD  CONSTRAINT \[DF\_Congthuc2CT\_Hs1\]  DEFAULT (0) FOR \[Hs1\]  
GO

ALTER TABLE \[dbo\].\[Congthuc2CT\] ADD  CONSTRAINT \[DF\_Congthuc2CT\_Hs2\]  DEFAULT (0) FOR \[Hs2\]  
GO

ALTER TABLE \[dbo\].\[Congthuc2CT\] ADD  CONSTRAINT \[DF\_Congthuc2CT\_Hs3\]  DEFAULT (0) FOR \[Hs3\]  
GO

ALTER TABLE \[dbo\].\[Congthuc2CT\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Congthuc2CT\_Congthuc2\] FOREIGN KEY(\[MaCT2\])  
REFERENCES \[dbo\].\[Congthuc2\] (\[MaCT2\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Congthuc2CT\] CHECK CONSTRAINT \[FK\_Congthuc2CT\_Congthuc2\]  
GO

## **\#36.**/\* Table **\[KetquaLopHP2\]    Script Date: 03/09/2025 3:07:44 PM \*\*\*\*\*\* *Chứa điểm sau khi Công bố \+ Điểm thi và Điểm tính toán hoàn chỉnh* \*/** 

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[KetquaLopHP2\](  
	\[MaLHP\] \[nvarchar\](12) NOT NULL,  
	\[MaSV\] \[nvarchar\](12) NOT NULL,  
	\[C11\] \[real\] NULL,  
	\[C12\] \[real\] NULL,  
	\[C13\] \[real\] NULL,  
	\[C14\] \[real\] NULL,  
	\[C15\] \[real\] NULL,  
	\[C16\] \[real\] NULL,  
	\[C17\] \[real\] NULL,  
	\[C18\] \[real\] NULL,  
	\[C19\] \[real\] NULL,  
	\[C21\] \[real\] NULL,  
	\[C22\] \[real\] NULL,  
	\[C23\] \[real\] NULL,  
	\[C24\] \[real\] NULL,  
	\[C25\] \[real\] NULL,  
	\[C26\] \[real\] NULL,  
	\[C27\] \[real\] NULL,  
	\[C28\] \[real\] NULL,  
	\[C29\] \[real\] NULL,  
	\[C31\] \[real\] NULL,  
	\[C32\] \[real\] NULL,  
	\[C33\] \[real\] NULL,  
	\[C34\] \[real\] NULL,  
	\[C35\] \[real\] NULL,  
	\[C36\] \[real\] NULL,  
	\[C37\] \[real\] NULL,  
	\[C38\] \[real\] NULL,  
	\[C39\] \[real\] NULL,  
	\[TBHS\] \[real\] NULL,  
	\[CT1\] \[real\] NULL,  
	\[CT2\] \[real\] NULL,  
	\[DHP1\] \[real\] NULL,  
	\[DHP1Bon\] \[real\] NULL,  
	\[DHP1Chu\] \[nvarchar\](10) NULL,  
	\[DHP2\] \[real\] NULL,  
	\[DHP2Bon\] \[real\] NULL,  
	\[DHP2Chu\] \[nvarchar\](10) NULL,  
	\[DHP\] \[real\] NULL,  
	\[DHPBon\] \[real\] NULL,  
	\[DHPChu\] \[nvarchar\](10) NULL,  
	\[Ghichu\] \[nvarchar\](100) NULL,  
	\[DiemF\] \[int\] NULL,  
	\[GhichuPhongthi\] \[nvarchar\](100) NULL,  
	\[GhichuTuithi\] \[nvarchar\](100) NULL,  
	\[GhichuBangdiem\] \[nvarchar\](100) NULL,  
 CONSTRAINT \[PK\_KetquaLopHP2\] PRIMARY KEY CLUSTERED   
(  
	\[MaLHP\] ASC,  
	\[MaSV\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[KetquaLopHP2\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_KetquaLopHP2\_LopHP\] FOREIGN KEY(\[MaLHP\])  
REFERENCES \[dbo\].\[LopHP\] (\[MaLHP\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[KetquaLopHP2\] CHECK CONSTRAINT \[FK\_KetquaLopHP2\_LopHP\]  
GO

ALTER TABLE \[dbo\].\[KetquaLopHP2\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_KetquaLopHP2\_Sinhvien\] FOREIGN KEY(\[MaSV\])  
REFERENCES \[dbo\].\[Sinhvien\] (\[MaSV\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[KetquaLopHP2\] CHECK CONSTRAINT \[FK\_KetquaLopHP2\_Sinhvien\]  
GO

## **\#37.**/\* Table **\[KetquaLopHP2DC\]    Script Date: 03/09/2025 3:08:26 PM \*\*\*\*\*\* *Chứa điểm của GV nhập* \*/**

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[KetquaLopHP2DC\](  
	\[MaLHP\] \[nvarchar\](12) NOT NULL,  
	\[MaSV\] \[nvarchar\](12) NOT NULL,  
	\[MaUser\] \[nvarchar\](10) NOT NULL,  
	\[C11\] \[real\] NULL,  
	\[C12\] \[real\] NULL,  
	\[C13\] \[real\] NULL,  
	\[C14\] \[real\] NULL,  
	\[C15\] \[real\] NULL,  
	\[C16\] \[real\] NULL,  
	\[C17\] \[real\] NULL,  
	\[C18\] \[real\] NULL,  
	\[C19\] \[real\] NULL,  
	\[C21\] \[real\] NULL,  
	\[C22\] \[real\] NULL,  
	\[C23\] \[real\] NULL,  
	\[C24\] \[real\] NULL,  
	\[C25\] \[real\] NULL,  
	\[C26\] \[real\] NULL,  
	\[C27\] \[real\] NULL,  
	\[C28\] \[real\] NULL,  
	\[C29\] \[real\] NULL,  
	\[C31\] \[real\] NULL,  
	\[C32\] \[real\] NULL,  
	\[C33\] \[real\] NULL,  
	\[C34\] \[real\] NULL,  
	\[C35\] \[real\] NULL,  
	\[C36\] \[real\] NULL,  
	\[C37\] \[real\] NULL,  
	\[C38\] \[real\] NULL,  
	\[C39\] \[real\] NULL,  
	\[TBHS\] \[real\] NULL,  
	\[CT1\] \[real\] NULL,  
	\[CT2\] \[real\] NULL,  
	\[DHP1\] \[real\] NULL,  
	\[DHP1Bon\] \[real\] NULL,  
	\[DHP1Chu\] \[nvarchar\](10) NULL,  
	\[DHP2\] \[real\] NULL,  
	\[DHP2Bon\] \[real\] NULL,  
	\[DHP2Chu\] \[nvarchar\](10) NULL,  
	\[DHP\] \[real\] NULL,  
	\[DHPBon\] \[real\] NULL,  
	\[DHPChu\] \[nvarchar\](10) NULL,  
	\[Ghichu\] \[nvarchar\](100) NULL,  
	\[DiemF\] \[int\] NULL,  
	\[GhichuPhongthi\] \[nvarchar\](100) NULL,  
	\[GhichuTuithi\] \[nvarchar\](100) NULL,  
	\[GhichuBangdiem\] \[nvarchar\](100) NULL,  
 CONSTRAINT \[PK\_KetquaLopHP2DC\] PRIMARY KEY CLUSTERED   
(  
	\[MaLHP\] ASC,  
	\[MaSV\] ASC,  
	\[MaUser\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[KetquaLopHP2DC\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_KetquaLopHP2DC\_LopHP\] FOREIGN KEY(\[MaLHP\])  
REFERENCES \[dbo\].\[LopHP\] (\[MaLHP\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[KetquaLopHP2DC\] CHECK CONSTRAINT \[FK\_KetquaLopHP2DC\_LopHP\]  
GO

ALTER TABLE \[dbo\].\[KetquaLopHP2DC\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_KetquaLopHP2DC\_Sinhvien\] FOREIGN KEY(\[MaSV\])  
REFERENCES \[dbo\].\[Sinhvien\] (\[MaSV\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[KetquaLopHP2DC\] CHECK CONSTRAINT \[FK\_KetquaLopHP2DC\_Sinhvien\]  
GO

ALTER TABLE \[dbo\].\[KetquaLopHP2DC\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_KetquaLopHP2DC\_Users\] FOREIGN KEY(\[MaUser\])  
REFERENCES \[dbo\].\[Users\] (\[MaUser\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[KetquaLopHP2DC\] CHECK CONSTRAINT \[FK\_KetquaLopHP2DC\_Users\]  
GO

## **\#38.**/\* Table **\[Ketqua\]    Script Date: 03/09/2025 3:11:43 PM \*\*\*\*\*\*/**

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[Ketqua\](  
	\[MaSV\] \[nvarchar\](12) NOT NULL,  
	\[MaHP\] \[nvarchar\](10) NOT NULL,  
	\[DHP\] \[real\] NULL,  
	\[DHPBon\] \[real\] NULL,  
	\[DHPChu\] \[nvarchar\](10) NULL,  
	\[DHPTram\] \[real\] NULL,  
	\[DHPTramChu\] \[nvarchar\](10) NULL,  
	\[DHP1\] \[real\] NULL,  
	\[DHP1Bon\] \[real\] NULL,  
	\[DHP1Chu\] \[nvarchar\](10) NULL,  
	\[DHP2\] \[real\] NULL,  
	\[DHP2Bon\] \[real\] NULL,  
	\[DHP2Chu\] \[nvarchar\](10) NULL,  
	\[CT1\] \[real\] NULL,  
	\[CT2\] \[real\] NULL,  
	\[MaLHP\] \[nvarchar\](12) NULL,  
	\[Loai\] \[int\] NULL,  
	\[TinhdiemHB\] \[bit\] NULL,  
	\[MaHK\] \[nvarchar\](10) NULL,  
	\[Chon\] \[bit\] NULL,  
	\[Ghichu\] \[nvarchar\](200) NULL,  
	\[GhichuEN\] \[nvarchar\](200) NULL,  
	\[Ghichu2\] \[nvarchar\](200) NULL,  
	\[ChonCC\] \[bit\] NULL,  
 CONSTRAINT \[PK\_Ketqua\] PRIMARY KEY CLUSTERED   
(  
	\[MaSV\] ASC,  
	\[MaHP\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[Ketqua\] ADD  CONSTRAINT \[DF\_\_Ketqua\_\_Loai\_\_56C9B771\]  DEFAULT ((0)) FOR \[Loai\]  
GO

ALTER TABLE \[dbo\].\[Ketqua\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Ketqua\_Hocphan\] FOREIGN KEY(\[MaHP\])  
REFERENCES \[dbo\].\[Hocphan\] (\[MaHP\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Ketqua\] CHECK CONSTRAINT \[FK\_Ketqua\_Hocphan\]  
GO

ALTER TABLE \[dbo\].\[Ketqua\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Ketqua\_SinhVien1\] FOREIGN KEY(\[MaSV\])  
REFERENCES \[dbo\].\[Sinhvien\] (\[MaSV\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Ketqua\] CHECK CONSTRAINT \[FK\_Ketqua\_SinhVien1\]  
GO

## **\#39.**/\* Table **\[dbo\].\[LoaiHocphan\]    Script Date: 03/09/2025 3:13:29 PM \*\*\*\*\*\*/**

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[LoaiHocphan\](  
	\[MaLoaiHP\] \[nvarchar\](10) NOT NULL,  
	\[Loaihocphan\] \[nvarchar\](100) NOT NULL,  
	\[HesoHocphi\] \[real\] NOT NULL,  
	\[TT\] \[int\] NULL,  
 CONSTRAINT \[PK\_HocphanLoai\] PRIMARY KEY CLUSTERED   
(  
	\[MaLoaiHP\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

## **\#40.**/\* Table **\[dbo\].\[LoaiLopHP\]    Script Date: 03/09/2025 3:14:14 PM \*\*\*\*\*\*/**

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[LoaiLopHP\](  
	\[MaLLHP\] \[nvarchar\](10) NOT NULL,  
	\[LoaiLHP\] \[nvarchar\](100) NOT NULL,  
	\[HesoHocphi\] \[real\] NOT NULL,  
	\[TT\] \[int\] NULL,  
	\[Macdinh\] \[bit\] NULL,  
 CONSTRAINT \[PK\_LoaiLopHP\] PRIMARY KEY CLUSTERED   
(  
	\[MaLLHP\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[LoaiLopHP\] ADD  CONSTRAINT \[DF\_LoaiLopHP\_Macdinh\]  DEFAULT (0) FOR \[Macdinh\]  
GO

## **\#41.**/\* Table **\[Nhapdiem\]    Script Date: 03/09/2025 3:15:32 PM \*\*\*\*\*\* *Khi Công bố thì dữ liệu được ghi vào đây* \*/**

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[Nhapdiem\](  
	\[MaLHP\] \[nvarchar\](12) NOT NULL,  
	\[MaUser\] \[nvarchar\](10) NOT NULL,  
	\[Thoigian\] \[datetime\] NULL,  
 CONSTRAINT \[PK\_Nhapdiem\] PRIMARY KEY CLUSTERED   
(  
	\[MaLHP\] ASC,  
	\[MaUser\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[Nhapdiem\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Nhapdiem\_LopHP\] FOREIGN KEY(\[MaLHP\])  
REFERENCES \[dbo\].\[LopHP\] (\[MaLHP\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Nhapdiem\] CHECK CONSTRAINT \[FK\_Nhapdiem\_LopHP\]  
GO

ALTER TABLE \[dbo\].\[Nhapdiem\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Nhapdiem\_Users\] FOREIGN KEY(\[MaUser\])  
REFERENCES \[dbo\].\[Users\] (\[MaUser\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Nhapdiem\] CHECK CONSTRAINT \[FK\_Nhapdiem\_Users\]  
GO

## **\#42.**/\* Table **\[Diemdanh\]    Script Date: 07/09/2025 8:32:53 AM \*\*\*\*\*\*/**

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[Diemdanh\](  
	\[MaSV\] \[nvarchar\](12) NOT NULL,  
	\[Ngay\] \[datetime\] NOT NULL,  
	\[Buoi\] \[int\] NOT NULL,  
	\[MaLHP\] \[nvarchar\](12) NOT NULL,  
	\[Tiet1\] \[bit\] NULL,  
	\[Tiet2\] \[bit\] NULL,  
	\[Tiet3\] \[bit\] NULL,  
	\[Tiet4\] \[bit\] NULL,  
	\[Tiet5\] \[bit\] NULL,  
	\[Tiet6\] \[bit\] NULL,  
	\[Phep\] \[bit\] NULL,  
	\[Lydo\] \[nvarchar\](200) NULL,  
	\[Sotietvang\] \[int\] NULL,  
	\[MaHK\] \[nvarchar\](10) NULL,  
 CONSTRAINT \[PK\_Diemdanh\] PRIMARY KEY CLUSTERED   
(  
	\[MaSV\] ASC,  
	\[Ngay\] ASC,  
	\[Buoi\] ASC,  
	\[MaLHP\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[Diemdanh\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Diemdanh\_LopHP\] FOREIGN KEY(\[MaLHP\])  
REFERENCES \[dbo\].\[LopHP\] (\[MaLHP\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Diemdanh\] CHECK CONSTRAINT \[FK\_Diemdanh\_LopHP\]  
GO

ALTER TABLE \[dbo\].\[Diemdanh\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_Diemdanh\_Sinhvien\] FOREIGN KEY(\[MaSV\])  
REFERENCES \[dbo\].\[Sinhvien\] (\[MaSV\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[Diemdanh\] CHECK CONSTRAINT \[FK\_Diemdanh\_Sinhvien\]  
GO

## **\#43.**/\* Table **\[dbo\].\[db\_SinhvienHocphiHK\]    Script Date: 12/09/2025 1:43:42 PM \*\*\*\*\*\* Phát sinh  mới \*/**

USE \[EduManUni\_CamauVKC\]  
GO

/\*  Table \[dbo\].\[db\_SinhvienHocphiHK\]    Script Date: 24/09/2025 10:02:34 AM \*\*\*\*\*\*/  
SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[db\_SinhvienHocphiHK\](  
	\[MaSV\] \[nvarchar\](12) NOT NULL,  
	\[MaHK\] \[nvarchar\](10) NOT NULL,  
	\[MaKT\] \[nvarchar\](50) NOT NULL,  
	\[HocphiQD\] \[int\] NULL,  
	\[Miengiam\] \[int\] NULL,  
	\[Phainop\] \[int\] NULL,  
	\[Danop\] \[int\] NULL,  
	\[Conlai\] \[int\] NULL,  
	\[Ghichu\] \[nvarchar\](200) NULL,  
 CONSTRAINT \[PK\_db\_SinhvienHocphiHK\] PRIMARY KEY CLUSTERED   
(  
	\[MaSV\] ASC,  
	\[MaHK\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[db\_SinhvienHocphiHK\] ADD  CONSTRAINT \[DF\_db\_SinhvienHocphiHK\_MaKT\]  DEFAULT ('555') FOR \[MaKT\]  
GO

ALTER TABLE \[dbo\].\[db\_SinhvienHocphiHK\]  WITH CHECK ADD  CONSTRAINT \[FK\_db\_SinhvienHocphiHK\_KhoanthuHK\] FOREIGN KEY(\[MaKT\])  
REFERENCES \[dbo\].\[KhoanthuHK\] (\[MaKT\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[db\_SinhvienHocphiHK\] CHECK CONSTRAINT \[FK\_db\_SinhvienHocphiHK\_KhoanthuHK\]  
GO

ALTER TABLE \[dbo\].\[db\_SinhvienHocphiHK\]  WITH CHECK ADD  CONSTRAINT \[FK\_db\_SinhvienHocphiHK\_Sinhvien\] FOREIGN KEY(\[MaSV\])  
REFERENCES \[dbo\].\[Sinhvien\] (\[MaSV\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[db\_SinhvienHocphiHK\] CHECK CONSTRAINT \[FK\_db\_SinhvienHocphiHK\_Sinhvien\]  
GO

## **\#44.**/\* Table **\[dbo\].\[db\_ThongbaoHocphiHK\]    Script Date: 12/09/2025 1:52:35 PM \*\*\*\*\*\* Phát sinh  mới \*/**

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[db\_ThongbaoHocphiHK\](  
	\[MaHK\] \[nvarchar\](10) NOT NULL,  
	\[SoTB\] \[nvarchar\](50) NOT NULL,  
	\[NgayTB\] \[datetime\] NULL,  
	\[NgayBatdau\] \[datetime\] NULL,  
	\[NgayKetthuc\] \[datetime\] NULL,  
	\[BankID\] \[nvarchar\](15) NULL,  
	\[Ghichu\] \[nvarchar\](200) NULL,  
 CONSTRAINT \[PK\_ThongbaoHocphiHK\] PRIMARY KEY CLUSTERED   
(  
	\[MaHK\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

## **\#45.**/\* Table **\[dbo\].\[db\_BankAccountNo\]    Script Date: 12/09/2025 1:52:55 PM \*\*\*\*\*\* Phát sinh  mới \*/**

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[db\_BankAccountNo\](  
	\[BankID\] \[nvarchar\](15) NOT NULL,  
	\[BankName\] \[nvarchar\](50) NULL,  
	\[AccountNo\] \[nvarchar\](50) NULL,  
	\[AccountName\] \[nvarchar\](150) NULL,  
	\[Macdinh\] \[bit\] NULL,  
 CONSTRAINT \[PK\_db\_BankAccountNo\] PRIMARY KEY CLUSTERED   
(  
	\[BankID\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[db\_BankAccountNo\] ADD  CONSTRAINT \[DF\_db\_BankAccountNo\_Macdinh\]  DEFAULT ((0)) FOR \[Macdinh\]  
GO

## \#46**.**/\* Table \[db\_DotXTCounters\]    Script Date: 03/08/2025 9:36:07 AM \*\*\*\*\* **Phát sinh  mới \***/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[db\_DotXTCounters\](  
	\[MaDXT\] \[nvarchar\](10) NOT NULL,  
	\[SoCuoi\] \[int\] NOT NULL,  
PRIMARY KEY CLUSTERED   
(  
	\[MaDXT\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[db\_DotXTCounters\]  WITH CHECK ADD  CONSTRAINT \[FK\_db\_DotXTCounters\_DotXT\] FOREIGN KEY(\[MaDXT\])  
REFERENCES \[dbo\].\[DotXT\] (\[MaDXT\])  
ON UPDATE CASCADE  
ON DELETE CASCADE  
GO

ALTER TABLE \[dbo\].\[db\_DotXTCounters\] CHECK CONSTRAINT \[FK\_db\_DotXTCounters\_DotXT\]  
GO

## \#47**.**/\* Table \[ThisinhXT\]    Script Date: 25/07/2025 2:48:05 PM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[ThisinhXT\](  
	\[MaTSXT\] \[nvarchar\](12) NOT NULL,  
	\[Maso\] \[nvarchar\](50) NULL,  
	\[Holot\] \[nvarchar\](100) NULL,  
	\[Ten\] \[nvarchar\](50) NULL,  
	\[Ngaysinh\] \[datetime\] NULL,  
	\[Noisinh\] \[nvarchar\](200) NULL,  
	\[Gioitinh\] \[bit\] NULL,  
	\[Hokhau\] \[nvarchar\](200) NULL,  
	\[NamTN\] \[int\] NULL,  
	\[MaTHPT\] \[nvarchar\](10) NULL,  
	\[Diachi\] \[nvarchar\](200) NULL,  
	\[Dienthoai\] \[nvarchar\](100) NULL,  
	\[Email\] \[nvarchar\](100) NULL,  
	\[SoCMND\] \[nvarchar\](50) NULL,  
	\[NgaycapCMND\] \[datetime\] NULL,  
	\[NoicapCMND\] \[nvarchar\](100) NULL,  
	\[TT\] \[int\] NULL,  
	\[Trungtuyen\] \[int\] NULL,  
	\[Nhaphoc\] \[int\] NULL,  
	\[Phanlop\] \[int\] NULL,  
	\[MaDT\] \[nvarchar\](10) NULL,  
	\[MaTG\] \[nvarchar\](10) NULL,  
	\[MaDTCS\] \[nvarchar\](10) NULL,  
	\[MaKV\] \[nvarchar\](10) NULL,  
	\[MaDXT\] \[nvarchar\](10) NULL,  
	\[Ghichu\] \[nvarchar\](200) NULL,  
	\[GhichuXettuyen\] \[nvarchar\](200) NULL,  
	\[GhichuNhaphoc\] \[nvarchar\](200) NULL,  
	\[Sotien\] \[int\] NULL,  
	\[MaKPXTs\] \[nvarchar\](200) NULL,  
	\[Miengiam\] \[int\] NULL,  
	\[MaNG\] \[nvarchar\](10) NULL,  
	\[MaTHXT\] \[nvarchar\](10) NULL,  
	\[MaTCXT\] \[nvarchar\](10) NULL,  
	\[TongDXT\] \[real\] NULL,  
	\[DTBXT\] \[real\] NULL,  
	\[Hinh\_anh\] \[image\] NULL,  
	\[DiemUT\] \[real\] NULL,  
	\[MaQDTT\] \[nvarchar\](10) NULL,  
	\[GhichuTrungtuyen\] \[nvarchar\](200) NULL,  
	\[ThongbaoTrungtuyen\] \[bit\] NULL,  
	\[ThoigianThongbaoTrungtuyen\] \[datetime\] NULL,  
	\[Fld01\] \[nvarchar\](250) NULL,  
PRIMARY KEY CLUSTERED   
(  
	\[MaTSXT\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\] TEXTIMAGE\_ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[ThisinhXT\] ADD  DEFAULT (0) FOR \[ThongbaoTrungtuyen\]  
GO

ALTER TABLE \[dbo\].\[ThisinhXT\]  WITH CHECK ADD  CONSTRAINT \[FK\_ThisinhXT\_Dantoc\] FOREIGN KEY(\[MaDT\])  
REFERENCES \[dbo\].\[Dantoc\] (\[MaDT\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[ThisinhXT\] CHECK CONSTRAINT \[FK\_ThisinhXT\_Dantoc\]  
GO

ALTER TABLE \[dbo\].\[ThisinhXT\]  WITH CHECK ADD  CONSTRAINT \[FK\_ThisinhXT\_DotXT\] FOREIGN KEY(\[MaDXT\])  
REFERENCES \[dbo\].\[DotXT\] (\[MaDXT\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[ThisinhXT\] CHECK CONSTRAINT \[FK\_ThisinhXT\_DotXT\]  
GO

ALTER TABLE \[dbo\].\[ThisinhXT\]  WITH CHECK ADD  CONSTRAINT \[FK\_ThisinhXT\_DTCS\] FOREIGN KEY(\[MaDTCS\])  
REFERENCES \[dbo\].\[DTCS\] (\[MaDTCS\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[ThisinhXT\] CHECK CONSTRAINT \[FK\_ThisinhXT\_DTCS\]  
GO

ALTER TABLE \[dbo\].\[ThisinhXT\]  WITH CHECK ADD  CONSTRAINT \[FK\_ThisinhXT\_Khuvuc\] FOREIGN KEY(\[MaKV\])  
REFERENCES \[dbo\].\[Khuvuc\] (\[MaKV\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[ThisinhXT\] CHECK CONSTRAINT \[FK\_ThisinhXT\_Khuvuc\]  
GO

ALTER TABLE \[dbo\].\[ThisinhXT\]  WITH CHECK ADD  CONSTRAINT \[FK\_ThisinhXT\_QuyetdinhTT\] FOREIGN KEY(\[MaQDTT\])  
REFERENCES \[dbo\].\[QuyetdinhTT\] (\[MaQDTT\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[ThisinhXT\] CHECK CONSTRAINT \[FK\_ThisinhXT\_QuyetdinhTT\]  
GO

ALTER TABLE \[dbo\].\[ThisinhXT\]  WITH CHECK ADD  CONSTRAINT \[FK\_ThisinhXT\_Tongiao\] FOREIGN KEY(\[MaTG\])  
REFERENCES \[dbo\].\[Tongiao\] (\[MaTG\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[ThisinhXT\] CHECK CONSTRAINT \[FK\_ThisinhXT\_Tongiao\]  
GO

ALTER TABLE \[dbo\].\[ThisinhXT\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_ThisinhXT\_TruongTHPT\] FOREIGN KEY(\[MaTHPT\])  
REFERENCES \[dbo\].\[TruongTHPT\] (\[MaTHPT\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[ThisinhXT\] CHECK CONSTRAINT \[FK\_ThisinhXT\_TruongTHPT\]  
GO

## \#48./\* Table \[dbo\].\[DotXT\]    Script Date: 07/10/2025 9:24:16 AM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[DotXT\](  
	\[MaDXT\] \[nvarchar\](10) NOT NULL,  
	\[DotXT\] \[nvarchar\](200) NOT NULL,  
	\[Ma\_DXT\] \[nvarchar\](50) NOT NULL,  
	\[Ghichu\] \[nvarchar\](200) NULL,  
	\[PhuongthucXT\] \[nvarchar\](200) NULL,  
	\[Ngayketthuc\] \[datetime\] NULL,  
	\[NgayXetTuyen\] \[datetime\] NULL,  
	\[NgayBDthutuc\] \[datetime\] NULL,  
	\[NgayKTthutuc\] \[datetime\] NULL,  
	\[NgayNhapHoc\] \[datetime\] NULL,  
	\[DiadiemNhaphoc\] \[nvarchar\](250) NULL,  
	\[DiadiemThutuc\] \[nvarchar\](250) NULL,  
 CONSTRAINT \[PK\_\_DotXT\_\_786AA25E\] PRIMARY KEY CLUSTERED   
(  
	\[MaDXT\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

## \#49**.**/\* Table \[TruongTHPT\]    Script Date: 25/07/2025 2:51:49 PM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[TruongTHPT\](  
	\[MaTHPT\] \[nvarchar\](10) NOT NULL,  
	\[TruongTHPT\] \[nvarchar\](200) NOT NULL,  
	\[Diachi\] \[nvarchar\](200) NOT NULL,  
	\[Maso\] \[nvarchar\](10) NOT NULL,  
	\[MaKV\] \[nvarchar\](10) NULL,  
 CONSTRAINT \[PK\_\_TruongTHPT\_\_01F40C98\] PRIMARY KEY CLUSTERED   
(  
	\[MaTHPT\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

## \#50**.**/\* Table \[QuyetdinhTT\]    Script Date: 25/07/2025 2:52:45 PM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[QuyetdinhTT\](  
	\[MaQDTT\] \[nvarchar\](10) NOT NULL,  
	\[So\] \[nvarchar\](200) NOT NULL,  
	\[Ngayky\] \[datetime\] NOT NULL,  
	\[Nguoiky\] \[nvarchar\](200) NULL,  
	\[Noidung\] \[nvarchar\](200) NULL,  
PRIMARY KEY CLUSTERED   
(  
	\[MaQDTT\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

## \#51**.**/\* Table \[db\_ThisinhXTnopHoso\]    Script Date: 03/08/2025 9:37:53 AM \*\*\*\*\*\***Phát sinh  mới \***/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[db\_ThisinhXTnopHoso\](  
	\[MaTSXT\] \[nvarchar\](12) NOT NULL,  
	\[hs1\] \[bit\] NULL,  
	\[hs2\] \[bit\] NULL,  
	\[hs3\] \[bit\] NULL,  
	\[hs4\] \[bit\] NULL,  
	\[hs5\] \[bit\] NULL,  
	\[hs6\] \[bit\] NULL,  
	\[hs7\] \[bit\] NULL,  
	\[hs8\] \[bit\] NULL,  
	\[hs9\] \[bit\] NULL,  
	\[hs10\] \[bit\] NULL,  
	\[hs11\] \[bit\] NULL,  
	\[hs12\] \[bit\] NULL,  
	\[hs13\] \[nvarchar\](100) NULL,  
	\[hs14\] \[bit\] NULL,  
	\[hs15\] \[bit\] NULL,  
	\[hs16\] \[bit\] NULL,  
	\[GhiChu\] \[nvarchar\](200) NULL,  
	\[NopOnline\] \[bit\] NULL,  
	\[MaTiepCan\] \[nvarchar\](4) NULL,  
	\[SoDT\] \[nvarchar\](50) NULL,  
	\[NguoiNhan\] \[nvarchar\](20) NULL,  
	\[NgayNhan\] \[datetime\] NULL,  
	\[NguoiSua\] \[nvarchar\](20) NULL,  
	\[NgaySua\] \[datetime\] NULL,  
	\[LPsochungtu\] \[int\] IDENTITY(1,1) NOT NULL,  
	\[LPsotien\] \[int\] NULL,  
	\[LPnoidungthu\] \[nvarchar\](100) NULL,  
	\[LPnguoinop\] \[nvarchar\](50) NULL,  
	\[LPnguoithu\] \[nvarchar\](100) NULL,  
	\[LPngaythu\] \[datetime\] NULL,  
	\[LPviettelPay\] \[bit\] NULL,  
	\[XLhanhkiem\] \[nchar\](1) NULL,  
	\[NguoiXT\] \[nvarchar\](20) NULL,  
	\[NgayXT\] \[datetime\] NULL,  
	\[RaSoat\] \[nchar\](1) NULL,  
	\[NguoiRasoat\] \[nvarchar\](20) NULL,  
	\[NgayRasoat\] \[datetime\] NULL,  
	\[Mon1\] \[real\] NULL,  
	\[Mon2\] \[real\] NULL,  
	\[Mon3\] \[real\] NULL,  
	\[DiemUT\] \[real\] NULL,  
	\[DiemXT\] \[real\] NULL,  
	\[Tuyenthang\] \[bit\] NULL,  
	\[DongPhuc\_SL\] \[tinyint\] NULL,  
	\[DongPhuc\_Tien\] \[int\] NULL,  
	\[DoGDTC\_SL\] \[tinyint\] NULL,  
	\[DoGDTC\_Tien\] \[int\] NULL,  
	\[BHtoandien\_Tien\] \[int\] NULL,  
	\[KhamSK\_Tien\] \[int\] NULL,  
	\[Nguoithu\_LPnhaphoc\] \[nvarchar\](200) NULL,  
	\[Ngaythu\_LPnhaphoc\] \[datetime\] NULL,  
	\[NoidungThu\_LPnhaphoc\] \[nvarchar\](300) NULL,  
 CONSTRAINT \[PK\_db\_ThisinhXTnopHoso\] PRIMARY KEY CLUSTERED   
(  
	\[MaTSXT\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[db\_ThisinhXTnopHoso\]  WITH CHECK ADD  CONSTRAINT \[FK\_db\_ThisinhXTnopHoso\_ThisinhXT\] FOREIGN KEY(\[MaTSXT\])  
REFERENCES \[dbo\].\[ThisinhXT\] (\[MaTSXT\])  
ON UPDATE CASCADE  
ON DELETE CASCADE  
GO

ALTER TABLE \[dbo\].\[db\_ThisinhXTnopHoso\] CHECK CONSTRAINT \[FK\_db\_ThisinhXTnopHoso\_ThisinhXT\]  
GO

## \#52**.**/\* Table \[ThisinhXTMonXT\]    Script Date: 03/08/2025 9:40:30 AM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[ThisinhXTMonXT\](  
	\[MaTSXT\] \[nvarchar\](12) NOT NULL,  
	\[MaMXT\] \[nvarchar\](10) NOT NULL,  
	\[Diem\] \[real\] NULL,  
	\[Ghichu\] \[nvarchar\](200) NULL,  
PRIMARY KEY CLUSTERED   
(  
	\[MaTSXT\] ASC,  
	\[MaMXT\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[ThisinhXTMonXT\]  WITH CHECK ADD  CONSTRAINT \[FK\_ThisinhXTMonXT\_MonXT\] FOREIGN KEY(\[MaMXT\])  
REFERENCES \[dbo\].\[MonXT\] (\[MaMXT\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[ThisinhXTMonXT\] CHECK CONSTRAINT \[FK\_ThisinhXTMonXT\_MonXT\]  
GO

ALTER TABLE \[dbo\].\[ThisinhXTMonXT\]  WITH CHECK ADD  CONSTRAINT \[FK\_ThisinhXTMonXT\_ThisinhXT\] FOREIGN KEY(\[MaTSXT\])  
REFERENCES \[dbo\].\[ThisinhXT\] (\[MaTSXT\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[ThisinhXTMonXT\] CHECK CONSTRAINT \[FK\_ThisinhXTMonXT\_ThisinhXT\]  
GO

# \#53**.**/\* Table \[MonXT\]    Script Date: 03/08/2025 9:43:26 AM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[MonXT\](  
	\[MaMXT\] \[nvarchar\](10) NOT NULL,  
	\[MonXT\] \[nvarchar\](200) NOT NULL,  
	\[Viettat\] \[nvarchar\](200) NOT NULL,  
PRIMARY KEY CLUSTERED   
(  
	\[MaMXT\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

## \#54**.**/\* Table \[ThisinhXTNguyenvongXT\]    Script Date: 03/08/2025 9:44:10 AM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[ThisinhXTNguyenvongXT\](  
	\[MaTSXT\] \[nvarchar\](12) NOT NULL,  
	\[MaNVXT\] \[int\] NOT NULL,  
	\[MaNG\] \[nvarchar\](10) NULL,  
	\[MaTHXT\] \[nvarchar\](10) NULL,  
	\[MaTCXT\] \[nvarchar\](10) NULL,  
	\[TongDXT\] \[real\] NULL,  
	\[DTBXT\] \[real\] NULL,  
	\[Trungtuyen\] \[int\] NULL,  
PRIMARY KEY CLUSTERED   
(  
	\[MaTSXT\] ASC,  
	\[MaNVXT\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[ThisinhXTNguyenvongXT\]  WITH CHECK ADD  CONSTRAINT \[FK\_ThisinhXTNguyenvongXT\_Nganhhoc\] FOREIGN KEY(\[MaNG\])  
REFERENCES \[dbo\].\[Nganhhoc\] (\[MaNG\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[ThisinhXTNguyenvongXT\] CHECK CONSTRAINT \[FK\_ThisinhXTNguyenvongXT\_Nganhhoc\]  
GO

ALTER TABLE \[dbo\].\[ThisinhXTNguyenvongXT\]  WITH CHECK ADD  CONSTRAINT \[FK\_ThisinhXTNguyenvongXT\_ThisinhXT\] FOREIGN KEY(\[MaTSXT\])  
REFERENCES \[dbo\].\[ThisinhXT\] (\[MaTSXT\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[ThisinhXTNguyenvongXT\] CHECK CONSTRAINT \[FK\_ThisinhXTNguyenvongXT\_ThisinhXT\]  
GO

ALTER TABLE \[dbo\].\[ThisinhXTNguyenvongXT\]  WITH NOCHECK ADD  CONSTRAINT \[FK\_ThisinhXTNguyenvongXT\_TieuchiXT\] FOREIGN KEY(\[MaTCXT\])  
REFERENCES \[dbo\].\[TieuchiXT\] (\[MaTCXT\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[ThisinhXTNguyenvongXT\] CHECK CONSTRAINT \[FK\_ThisinhXTNguyenvongXT\_TieuchiXT\]  
GO

ALTER TABLE \[dbo\].\[ThisinhXTNguyenvongXT\]  WITH CHECK ADD  CONSTRAINT \[FK\_ThisinhXTNguyenvongXT\_TohopXT\] FOREIGN KEY(\[MaTHXT\])  
REFERENCES \[dbo\].\[TohopXT\] (\[MaTHXT\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[ThisinhXTNguyenvongXT\] CHECK CONSTRAINT \[FK\_ThisinhXTNguyenvongXT\_TohopXT\]  
GO

## \#55**.**/\* Table \[TieuchiXT\]    Script Date: 03/08/2025 9:45:51 AM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[TieuchiXT\](  
	\[MaTCXT\] \[nvarchar\](10) NOT NULL,  
	\[TieuchiXT\] \[nvarchar\](200) NOT NULL,  
	\[Ghichu\] \[nvarchar\](200) NULL,  
PRIMARY KEY CLUSTERED   
(  
	\[MaTCXT\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

## \#56**.**/\* Table \[TohopXT\]    Script Date: 03/08/2025 9:46:08 AM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[TohopXT\](  
	\[MaTHXT\] \[nvarchar\](10) NOT NULL,  
	\[TohopXT\] \[nvarchar\](200) NOT NULL,  
	\[Kyhieu\] \[nvarchar\](200) NOT NULL,  
PRIMARY KEY CLUSTERED   
(  
	\[MaTHXT\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

## \#57**.**/\* Table \[DotXTNganhhocNguyenvongXT\]    Script Date: 03/08/2025 10:23:03 AM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[DotXTNganhhocNguyenvongXT\](  
	\[MaDXT\] \[nvarchar\](10) NOT NULL,  
	\[MaNG\] \[nvarchar\](10) NOT NULL,  
	\[MaNVXT\] \[int\] NOT NULL,  
	\[DiemchuanTongDXT\] \[real\] NULL,  
	\[SoluongTongDXT\] \[int\] NULL,  
	\[DiemchuanDTBXT\] \[real\] NULL,  
	\[SoluongDTBXT\] \[int\] NULL,  
PRIMARY KEY CLUSTERED   
(  
	\[MaDXT\] ASC,  
	\[MaNG\] ASC,  
	\[MaNVXT\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[DotXTNganhhocNguyenvongXT\]  WITH CHECK ADD  CONSTRAINT \[FK\_DotXTNganhhocNguyenvongXT\_DotXT\] FOREIGN KEY(\[MaDXT\])  
REFERENCES \[dbo\].\[DotXT\] (\[MaDXT\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[DotXTNganhhocNguyenvongXT\] CHECK CONSTRAINT \[FK\_DotXTNganhhocNguyenvongXT\_DotXT\]  
GO

ALTER TABLE \[dbo\].\[DotXTNganhhocNguyenvongXT\]  WITH CHECK ADD  CONSTRAINT \[FK\_DotXTNganhhocNguyenvongXT\_Nganhhoc\] FOREIGN KEY(\[MaNG\])  
REFERENCES \[dbo\].\[Nganhhoc\] (\[MaNG\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[DotXTNganhhocNguyenvongXT\] CHECK CONSTRAINT \[FK\_DotXTNganhhocNguyenvongXT\_Nganhhoc\]  
GO

## \#58**.**/\* Table \[DotXTNganhhoc\]    Script Date: 03/08/2025 10:23:53 AM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[DotXTNganhhoc\](  
	\[MaDXT\] \[nvarchar\](10) NOT NULL,  
	\[MaNG\] \[nvarchar\](10) NOT NULL,  
	\[Chitieu\] \[int\] NULL,  
	\[SoluongTongDXT\] \[int\] NULL,  
	\[Conthieu\] \[int\] NULL,  
	\[SoluongDTBXT\] \[int\] NULL,  
PRIMARY KEY CLUSTERED   
(  
	\[MaDXT\] ASC,  
	\[MaNG\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[DotXTNganhhoc\]  WITH CHECK ADD  CONSTRAINT \[FK\_DotXTNganhhoc\_DotXT\] FOREIGN KEY(\[MaDXT\])  
REFERENCES \[dbo\].\[DotXT\] (\[MaDXT\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[DotXTNganhhoc\] CHECK CONSTRAINT \[FK\_DotXTNganhhoc\_DotXT\]  
GO

ALTER TABLE \[dbo\].\[DotXTNganhhoc\]  WITH CHECK ADD  CONSTRAINT \[FK\_DotXTNganhhoc\_Nganhhoc\] FOREIGN KEY(\[MaNG\])  
REFERENCES \[dbo\].\[Nganhhoc\] (\[MaNG\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[DotXTNganhhoc\] CHECK CONSTRAINT \[FK\_DotXTNganhhoc\_Nganhhoc\]  
GO

## \#59**.**/\* Table \[DotXTNganhhocTohopXT\]    Script Date: 03/08/2025 10:24:37 AM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[DotXTNganhhocTohopXT\](  
	\[MaDXT\] \[nvarchar\](10) NOT NULL,  
	\[MaNG\] \[nvarchar\](10) NOT NULL,  
	\[MaTHXT\] \[nvarchar\](10) NOT NULL,  
	\[TT\] \[int\] NULL,  
PRIMARY KEY CLUSTERED   
(  
	\[MaDXT\] ASC,  
	\[MaNG\] ASC,  
	\[MaTHXT\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[DotXTNganhhocTohopXT\]  WITH CHECK ADD  CONSTRAINT \[FK\_DotXTNganhhocTohopXT\_DotXT\] FOREIGN KEY(\[MaDXT\])  
REFERENCES \[dbo\].\[DotXT\] (\[MaDXT\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[DotXTNganhhocTohopXT\] CHECK CONSTRAINT \[FK\_DotXTNganhhocTohopXT\_DotXT\]  
GO

ALTER TABLE \[dbo\].\[DotXTNganhhocTohopXT\]  WITH CHECK ADD  CONSTRAINT \[FK\_DotXTNganhhocTohopXT\_Nganhhoc\] FOREIGN KEY(\[MaNG\])  
REFERENCES \[dbo\].\[Nganhhoc\] (\[MaNG\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[DotXTNganhhocTohopXT\] CHECK CONSTRAINT \[FK\_DotXTNganhhocTohopXT\_Nganhhoc\]  
GO

ALTER TABLE \[dbo\].\[DotXTNganhhocTohopXT\]  WITH CHECK ADD  CONSTRAINT \[FK\_DotXTNganhhocTohopXT\_TohopXT\] FOREIGN KEY(\[MaTHXT\])  
REFERENCES \[dbo\].\[TohopXT\] (\[MaTHXT\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[DotXTNganhhocTohopXT\] CHECK CONSTRAINT \[FK\_DotXTNganhhocTohopXT\_TohopXT\]  
GO

## \#60**.**/\* Table \[TohopXTMonXT\]    Script Date: 03/08/2025 10:26:33 AM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[TohopXTMonXT\](  
	\[MaTHXT\] \[nvarchar\](10) NOT NULL,  
	\[MaMXT\] \[nvarchar\](10) NOT NULL,  
	\[Heso\] \[real\] NULL,  
	\[TT\] \[int\] NULL,  
	\[TTUTXT\] \[int\] NULL,  
PRIMARY KEY CLUSTERED   
(  
	\[MaTHXT\] ASC,  
	\[MaMXT\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[TohopXTMonXT\]  WITH CHECK ADD  CONSTRAINT \[FK\_TohopXTMonXT\_MonXT\] FOREIGN KEY(\[MaMXT\])  
REFERENCES \[dbo\].\[MonXT\] (\[MaMXT\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[TohopXTMonXT\] CHECK CONSTRAINT \[FK\_TohopXTMonXT\_MonXT\]  
GO

ALTER TABLE \[dbo\].\[TohopXTMonXT\]  WITH CHECK ADD  CONSTRAINT \[FK\_TohopXTMonXT\_TohopXT\] FOREIGN KEY(\[MaTHXT\])  
REFERENCES \[dbo\].\[TohopXT\] (\[MaTHXT\])  
ON UPDATE CASCADE  
GO

ALTER TABLE \[dbo\].\[TohopXTMonXT\] CHECK CONSTRAINT \[FK\_TohopXTMonXT\_TohopXT\]  
GO

## \#61**.**/\* Table \[db\_TrinhdoVanhoa\]    Script Date: 04/08/2025 11:28:34 AM \*\*\*\*\*\***Phát sinh  mới \***/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[db\_TrinhdoVanhoa\](  
	\[TrinhdoVH\] \[nvarchar\](50) NOT NULL,  
 CONSTRAINT \[PK\_db\_TrinhdoVanhoa\] PRIMARY KEY CLUSTERED   
(  
	\[TrinhdoVH\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

## \#62**.**/\* Table \[db\_NoicapCMND\]    Script Date: 05/08/2025 8:26:58 AM \*\*\*\*\*\***Phát sinh  mới \***/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[db\_NoicapCMND\](  
	\[NoicapCMND\] \[nvarchar\](100) NOT NULL,  
 CONSTRAINT \[PK\_db\_NoicapCMND\] PRIMARY KEY CLUSTERED   
(  
	\[NoicapCMND\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

## \#63**.**/\* Table \[db\_TiepCan\]    Script Date: 05/08/2025 8:29:19 AM \*\*\*\*\*\***Phát sinh  mới \***/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[db\_TiepCan\](  
	\[MaTiepCan\] \[nvarchar\](4) NOT NULL,  
	\[TenTiepCan\] \[nvarchar\](50) NULL,  
 CONSTRAINT \[PK\_db\_TiepCan\] PRIMARY KEY CLUSTERED   
(  
	\[MaTiepCan\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

## \#64/\* Table \[dbo\].\[**Nhomphong**\]    Script Date: 26/01/2026 7:43:09 AM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[Nhomphong\](  
	\[MaNP\] \[nvarchar\](10) NOT NULL,  
	\[Nhomphong\] \[nvarchar\](100) NULL,  
	\[MaNPcha\] \[nvarchar\](10) NULL,  
	\[MaNPgoc\] \[nvarchar\](10) NULL,  
 CONSTRAINT \[PK\_Nhomphong\] PRIMARY KEY CLUSTERED   
(  
	\[MaNP\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

## \#65./\* Table \[dbo\].\[**Loaiphong**\]    Script Date: 27/01/2026 8:09:50 AM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[Loaiphong\](  
	\[MaLP\] \[nvarchar\](10) NOT NULL,  
	\[Loaiphong\] \[nvarchar\](100) NULL,  
	\[TT\] \[int\] NULL,  
 CONSTRAINT \[PK\_Loaiphong\] PRIMARY KEY CLUSTERED   
(  
	\[MaLP\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[Loaiphong\] ADD  CONSTRAINT \[DF\_Loaiphong\_TT\]  DEFAULT (0) FOR \[TT\]  
GO

## \#66./\* Table \[dbo\].\[Hocvi\]    Script Date: 26/01/2026 7:44:51 AM \*\*\*\*\*\*/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE TABLE \[dbo\].\[Hocvi\](  
	\[MaHV\] \[nvarchar\](10) NOT NULL,  
	\[Hocvi\] \[nvarchar\](100) NOT NULL,  
	\[Viettat\] \[nvarchar\](50) NOT NULL,  
	\[HocviEN\] \[nvarchar\](100) NULL,  
	\[ViettatEN\] \[nvarchar\](50) NULL,  
	\[TT\] \[int\] NULL,  
	\[Macdinh\] \[bit\] NULL,  
 CONSTRAINT \[PK\_Hocvi\] PRIMARY KEY CLUSTERED   
(  
	\[MaHV\] ASC  
)WITH (PAD\_INDEX \= OFF, STATISTICS\_NORECOMPUTE \= OFF, IGNORE\_DUP\_KEY \= OFF, ALLOW\_ROW\_LOCKS \= ON, ALLOW\_PAGE\_LOCKS \= ON, OPTIMIZE\_FOR\_SEQUENTIAL\_KEY \= OFF) ON \[PRIMARY\]  
) ON \[PRIMARY\]  
GO

ALTER TABLE \[dbo\].\[Hocvi\] ADD  CONSTRAINT \[DF\_Hocvi\_Macdinh\]  DEFAULT (0) FOR \[Macdinh\]  
GO

## \#67./\* View \[dbo\].\[web\_LopTN\]    Script Date: 26/08/2025 9:52:15 AM \*\*\*\*\*\***Phát sinh  mới \***/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE VIEW \[dbo\].\[web\_LopTN\]  
AS  
SELECT        N'Khóa 20' \+ SUBSTRING(L.MaL, 2, 2\) AS Khoahoc, DV.Donvi, NH.Dacdiem, NH.NganhViettat, NH.BacDTHienthi, L.MaL, L.Tenlop, GV.Holot \+ N' ' \+ GV.Ten AS Gvcn, N'Tín chỉ' AS LoaihinhDT, L.Soluong AS SoluongBD,   
                         SUM(CASE WHEN SV.Tinhtrang \= 3 THEN 1 ELSE 0 END) AS SoluongTN  
FROM            EdumanUni\_CamauVKC.dbo.Nganhhoc AS NH INNER JOIN  
                         EdumanUni\_CamauVKC.dbo.Lop AS L ON NH.MaNG \= L.MaNG LEFT JOIN  
                         EdumanUni\_CamauVKC.dbo.Giaovien AS GV ON L.MaGV \= GV.MaGV LEFT JOIN  
                         EdumanUni\_CamauVKC.dbo.Donvi AS DV ON NH.MaDV \= DV.MaDV LEFT JOIN  
                         EdumanUni\_CamauVKC.dbo.SinhVien AS SV ON L.MaL \= SV.MaL  
GROUP BY N'Khóa 20' \+ SUBSTRING(L.MaL, 2, 2), DV.Donvi, NH.Dacdiem, NH.NganhViettat, NH.BacDTHienthi, L.MaL, L.Tenlop, GV.Holot \+ N' ' \+ GV.Ten, L.Soluong  
UNION ALL  
SELECT        N'Khóa 20' \+ SUBSTRING(L.MaL, 2, 2\) AS Khoahoc, NL.Nhomlop, NH.Dacdiem, NH.NganhViettat, NH.BacDTHienthi, L.MaL, L.Tenlop, GV.HotenGV, CASE WHEN RIGHT(NH.BacDTViettat, 2\)   
                         \= 'TC' THEN N'Tín chỉ' ELSE N'Niên chế' END AS LoaihinhDT, L.Soluong, SUM(CASE WHEN SV.Tinhtrang \= 3 THEN 1 ELSE 0 END) AS SoluongTN  
FROM            Daotao\_CamauVKC.dbo.NganhHoc AS NH INNER JOIN  
                         Daotao\_CamauVKC.dbo.Lop AS L ON NH.MaNG \= L.MaNG INNER JOIN  
                         Daotao\_CamauVKC.dbo.Giaovien AS GV ON L.MaGV \= GV.MaGV INNER JOIN  
                         Daotao\_CamauVKC.dbo.Nhomlop AS NL ON L.MaNL \= NL.MaNL INNER JOIN  
                         Daotao\_CamauVKC.dbo.SinhVien AS SV ON L.MaL \= SV.MaL  
GROUP BY N'Khóa 20' \+ SUBSTRING(L.MaL, 2, 2), NL.Nhomlop, NH.Dacdiem, NH.NganhViettat, NH.BacDTHienthi, L.MaL, L.Tenlop, GV.HotenGV, CASE WHEN RIGHT(NH.BacDTViettat, 2\) \= 'TC' THEN N'Tín chỉ' ELSE N'Niên chế' END,   
                         L.Soluong  
HAVING        N'Khóa 20' \+ SUBSTRING(L.MaL, 2, 2\) NOT IN (N'Khóa 2022', N'Khóa 2023', N'Khóa 2024') AND SUM(CASE WHEN SV.Tinhtrang \= 3 THEN 1 ELSE 0 END) \> 0;  
GO

EXEC sys.sp\_addextendedproperty @name=N'MS\_DiagramPane1', @value=N'\[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00\]  
Begin DesignProperties \=   
   Begin PaneConfigurations \=   
      Begin PaneConfiguration \= 0  
         NumPanes \= 4  
         Configuration \= "(H (1\[14\] 4\[12\] 2\[36\] 3\) )"  
      End  
      Begin PaneConfiguration \= 1  
         NumPanes \= 3  
         Configuration \= "(H (1 \[50\] 4 \[25\] 3))"  
      End  
      Begin PaneConfiguration \= 2  
         NumPanes \= 3  
         Configuration \= "(H (1 \[50\] 2 \[25\] 3))"  
      End  
      Begin PaneConfiguration \= 3  
         NumPanes \= 3  
         Configuration \= "(H (4 \[30\] 2 \[40\] 3))"  
      End  
      Begin PaneConfiguration \= 4  
         NumPanes \= 2  
         Configuration \= "(H (1 \[56\] 3))"  
      End  
      Begin PaneConfiguration \= 5  
         NumPanes \= 2  
         Configuration \= "(H (2 \[66\] 3))"  
      End  
      Begin PaneConfiguration \= 6  
         NumPanes \= 2  
         Configuration \= "(H (4 \[50\] 3))"  
      End  
      Begin PaneConfiguration \= 7  
         NumPanes \= 1  
         Configuration \= "(V (3))"  
      End  
      Begin PaneConfiguration \= 8  
         NumPanes \= 3  
         Configuration \= "(H (1\[56\] 4\[18\] 2\) )"  
      End  
      Begin PaneConfiguration \= 9  
         NumPanes \= 2  
         Configuration \= "(H (1 \[75\] 4))"  
      End  
      Begin PaneConfiguration \= 10  
         NumPanes \= 2  
         Configuration \= "(H (1\[66\] 2\) )"  
      End  
      Begin PaneConfiguration \= 11  
         NumPanes \= 2  
         Configuration \= "(H (4 \[60\] 2))"  
      End  
      Begin PaneConfiguration \= 12  
         NumPanes \= 1  
         Configuration \= "(H (1) )"  
      End  
      Begin PaneConfiguration \= 13  
         NumPanes \= 1  
         Configuration \= "(V (4))"  
      End  
      Begin PaneConfiguration \= 14  
         NumPanes \= 1  
         Configuration \= "(V (2))"  
      End  
      ActivePaneConfig \= 0  
   End  
   Begin DiagramPane \=   
      Begin Origin \=   
         Top \= 0  
         Left \= 0  
      End  
      Begin Tables \=   
      End  
   End  
   Begin SQLPane \=   
   End  
   Begin DataPane \=   
      Begin ParameterDefaults \= ""  
      End  
      Begin ColumnWidths \= 12  
         Width \= 284  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
      End  
   End  
   Begin CriteriaPane \=   
      Begin ColumnWidths \= 11  
         Column \= 1440  
         Alias \= 900  
         Table \= 1170  
         Output \= 720  
         Append \= 1400  
         NewValue \= 1170  
         SortType \= 1350  
         SortOrder \= 1410  
         GroupBy \= 1350  
         Filter \= 1350  
         Or \= 1350  
         Or \= 1350  
         Or \= 1350  
      End  
   End  
End  
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'web\_LopTN'  
GO

EXEC sys.sp\_addextendedproperty @name=N'MS\_DiagramPaneCount', @value=1 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'web\_LopTN'  
GO

## \#68./\* View \[dbo\].\[web\_QuyetdinhTN\]    Script Date: 26/08/2025 9:52:49 AM \*\*\*\*\*\***Phát sinh  mới \***/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE VIEW \[dbo\].\[web\_QuyetdinhTN\]  
AS  
SELECT        MaQDTN, So, Ngayky, Nguoiky  
FROM            Daotao\_CamauVKC.dbo.QuyetdinhTN  
WHERE        MaQDTN \<\> '000'  
UNION  
SELECT        MaQDTN, So, Ngayky, Nguoiky  
FROM            EdumanUni\_CamauVKC.dbo.QuyetdinhTN;  
GO

EXEC sys.sp\_addextendedproperty @name=N'MS\_DiagramPane1', @value=N'\[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00\]  
Begin DesignProperties \=   
   Begin PaneConfigurations \=   
      Begin PaneConfiguration \= 0  
         NumPanes \= 4  
         Configuration \= "(H (1\[26\] 4\[14\] 2\[20\] 3\) )"  
      End  
      Begin PaneConfiguration \= 1  
         NumPanes \= 3  
         Configuration \= "(H (1 \[50\] 4 \[25\] 3))"  
      End  
      Begin PaneConfiguration \= 2  
         NumPanes \= 3  
         Configuration \= "(H (1 \[50\] 2 \[25\] 3))"  
      End  
      Begin PaneConfiguration \= 3  
         NumPanes \= 3  
         Configuration \= "(H (4 \[30\] 2 \[40\] 3))"  
      End  
      Begin PaneConfiguration \= 4  
         NumPanes \= 2  
         Configuration \= "(H (1 \[56\] 3))"  
      End  
      Begin PaneConfiguration \= 5  
         NumPanes \= 2  
         Configuration \= "(H (2 \[66\] 3))"  
      End  
      Begin PaneConfiguration \= 6  
         NumPanes \= 2  
         Configuration \= "(H (4 \[50\] 3))"  
      End  
      Begin PaneConfiguration \= 7  
         NumPanes \= 1  
         Configuration \= "(V (3))"  
      End  
      Begin PaneConfiguration \= 8  
         NumPanes \= 3  
         Configuration \= "(H (1\[56\] 4\[18\] 2\) )"  
      End  
      Begin PaneConfiguration \= 9  
         NumPanes \= 2  
         Configuration \= "(H (1 \[75\] 4))"  
      End  
      Begin PaneConfiguration \= 10  
         NumPanes \= 2  
         Configuration \= "(H (1\[66\] 2\) )"  
      End  
      Begin PaneConfiguration \= 11  
         NumPanes \= 2  
         Configuration \= "(H (4 \[60\] 2))"  
      End  
      Begin PaneConfiguration \= 12  
         NumPanes \= 1  
         Configuration \= "(H (1) )"  
      End  
      Begin PaneConfiguration \= 13  
         NumPanes \= 1  
         Configuration \= "(V (4))"  
      End  
      Begin PaneConfiguration \= 14  
         NumPanes \= 1  
         Configuration \= "(V (2))"  
      End  
      ActivePaneConfig \= 0  
   End  
   Begin DiagramPane \=   
      Begin Origin \=   
         Top \= 0  
         Left \= 0  
      End  
      Begin Tables \=   
      End  
   End  
   Begin SQLPane \=   
   End  
   Begin DataPane \=   
      Begin ParameterDefaults \= ""  
      End  
      Begin ColumnWidths \= 9  
         Width \= 284  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
      End  
   End  
   Begin CriteriaPane \=   
      Begin ColumnWidths \= 11  
         Column \= 1440  
         Alias \= 900  
         Table \= 1170  
         Output \= 720  
         Append \= 1400  
         NewValue \= 1170  
         SortType \= 1350  
         SortOrder \= 1410  
         GroupBy \= 1350  
         Filter \= 1350  
         Or \= 1350  
         Or \= 1350  
         Or \= 1350  
      End  
   End  
End  
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'web\_QuyetdinhTN'  
GO

EXEC sys.sp\_addextendedproperty @name=N'MS\_DiagramPaneCount', @value=1 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'web\_QuyetdinhTN'  
GO

## \#69./\* View \[dbo\].\[web\_SinhvienTN\]    Script Date: 30/08/2025 2:47:33 PM \*\*\*\*\*\***Phát sinh  mới \***/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE VIEW \[dbo\].\[web\_SinhvienTN\]  
AS  
SELECT        sv.MaL, sv.Tinhtrang, sv.MaSV, sv.Maso, sv.Holot, sv.Ten, sv.Gioitinh, sv.Ngaysinh, sv.Noisinh, sv.SoCMND, sv.Hokhau, sv.Diachi, sv.MaDT, sv.MaTG, sv.Sovaoso, sv.Sohieu, sv.Nguoiky, sv.Ngayky, sv.MaQDTN, sv.Dienthoai, sv.Email, sv.Noilamviec,   
                         sv.DiemRLTL, CASE WHEN sv.DiemRLTL \>= 90 THEN N'Xuất sắc' WHEN sv.DiemRLTL \>= 80 THEN N'Tốt' WHEN sv.DiemRLTL \>= 70 THEN N'Khá' WHEN sv.DiemRLTL \>= 50 THEN N'Trung bình' ELSE N'Yếu' END AS XeploaiRL,   
                         sv.DTBTL AS DiemTN10, sv.DTBTLBon AS DiemTN4, sv.Hangtotnghiep AS XeploaiTN  
FROM            EdumanUni\_CamauVKC.dbo.Sinhvien AS sv  
WHERE        sv.MaL IS NOT NULL  
UNION  
SELECT        svg.MaL\_goc, svg.Tinhtrang, svg.MaSV, svg.Maso, svg.Holot, svg.Ten, svg.Gioitinh, svg.Ngaysinh, svg.Noisinh, svg.SoCMND, svg.Hokhau, svg.Diachi,  svg.MaDT, svg.MaTG, svg.Sovaoso, svg.Sohieu, svg.Nguoiky, TRY\_CONVERT(datetime, svg.Ngayky, 103),   
                         svg.MaQDTN, svg.Dienthoai, svg.Email, svg.Noilamviec, svg.DiemHanhkiem,   
                         CASE WHEN svg.DiemHanhkiem \>= 90 THEN N'Xuất sắc' WHEN svg.DiemHanhkiem \>= 80 THEN N'Tốt' WHEN svg.DiemHanhkiem \>= 70 THEN N'Khá' WHEN svg.DiemHanhkiem \>= 50 THEN N'Trung bình' ELSE N'Yếu' END,   
                         CASE WHEN svg.DTBHTBon IS NULL THEN svg.DTBTK ELSE svg.DTBHT END, svg.DTBHTBon, CASE WHEN svg.DTBHTBon IS NULL THEN svg.XLTK ELSE svg.XLHTBon END  
FROM            Daotao\_CamauVKC.dbo.Sinhvien AS svg  
WHERE        svg.MaL\_goc IS NOT NULL;  
GO

EXEC sys.sp\_addextendedproperty @name=N'MS\_DiagramPane1', @value=N'\[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00\]  
Begin DesignProperties \=   
   Begin PaneConfigurations \=   
      Begin PaneConfiguration \= 0  
         NumPanes \= 4  
         Configuration \= "(H (1\[24\] 4\[12\] 2\[19\] 3\) )"  
      End  
      Begin PaneConfiguration \= 1  
         NumPanes \= 3  
         Configuration \= "(H (1 \[50\] 4 \[25\] 3))"  
      End  
      Begin PaneConfiguration \= 2  
         NumPanes \= 3  
         Configuration \= "(H (1 \[50\] 2 \[25\] 3))"  
      End  
      Begin PaneConfiguration \= 3  
         NumPanes \= 3  
         Configuration \= "(H (4 \[30\] 2 \[40\] 3))"  
      End  
      Begin PaneConfiguration \= 4  
         NumPanes \= 2  
         Configuration \= "(H (1 \[56\] 3))"  
      End  
      Begin PaneConfiguration \= 5  
         NumPanes \= 2  
         Configuration \= "(H (2 \[66\] 3))"  
      End  
      Begin PaneConfiguration \= 6  
         NumPanes \= 2  
         Configuration \= "(H (4 \[50\] 3))"  
      End  
      Begin PaneConfiguration \= 7  
         NumPanes \= 1  
         Configuration \= "(V (3))"  
      End  
      Begin PaneConfiguration \= 8  
         NumPanes \= 3  
         Configuration \= "(H (1\[56\] 4\[18\] 2\) )"  
      End  
      Begin PaneConfiguration \= 9  
         NumPanes \= 2  
         Configuration \= "(H (1 \[75\] 4))"  
      End  
      Begin PaneConfiguration \= 10  
         NumPanes \= 2  
         Configuration \= "(H (1\[66\] 2\) )"  
      End  
      Begin PaneConfiguration \= 11  
         NumPanes \= 2  
         Configuration \= "(H (4 \[60\] 2))"  
      End  
      Begin PaneConfiguration \= 12  
         NumPanes \= 1  
         Configuration \= "(H (1) )"  
      End  
      Begin PaneConfiguration \= 13  
         NumPanes \= 1  
         Configuration \= "(V (4))"  
      End  
      Begin PaneConfiguration \= 14  
         NumPanes \= 1  
         Configuration \= "(V (2))"  
      End  
      ActivePaneConfig \= 0  
   End  
   Begin DiagramPane \=   
      Begin Origin \=   
         Top \= 0  
         Left \= 0  
      End  
      Begin Tables \=   
      End  
   End  
   Begin SQLPane \=   
   End  
   Begin DataPane \=   
      Begin ParameterDefaults \= ""  
      End  
      Begin ColumnWidths \= 24  
         Width \= 284  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
      End  
   End  
   Begin CriteriaPane \=   
      Begin ColumnWidths \= 11  
         Column \= 1440  
         Alias \= 900  
         Table \= 1170  
         Output \= 720  
         Append \= 1400  
         NewValue \= 1170  
         SortType \= 1350  
         SortOrder \= 1410  
         GroupBy \= 1350  
         Filter \= 1350  
         Or \= 1350  
         Or \= 1350  
         Or \= 1350  
      End  
   End  
End  
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'web\_SinhvienTN'  
GO

EXEC sys.sp\_addextendedproperty @name=N'MS\_DiagramPaneCount', @value=1 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'web\_SinhvienTN'  
GO

## \#70./\* View \[dbo\].\[web\_HockyTN\]    Script Date: 26/08/2025 9:53:33 AM \*\*\*\*\*\***Phát sinh  mới \***/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE VIEW \[dbo\].\[web\_HockyTN\]  
AS  
SELECT        L.MaL, L.MaHK2 AS MaHK, L.Hocky, L.Ngaybatdau, L.Ngayketthuc, L.Sotuan  
FROM            Daotao\_CamauVKC.dbo.LopHocky AS L  
UNION  
SELECT        L.MaL, HK.MaHK, HK.Hocky, HK.Ngaybatdau, HK.Ngayketthuc, HK.Sotuan  
FROM            EdumanUni\_CamauVKC.dbo.CTDTLop AS L INNER JOIN  
                         EdumanUni\_CamauVKC.dbo.Hocky AS HK ON L.MaHK \= HK.MaHK  
GROUP BY L.MaL, HK.MaHK, HK.Hocky, HK.Ngaybatdau, HK.Ngayketthuc, HK.Sotuan;  
GO

EXEC sys.sp\_addextendedproperty @name=N'MS\_DiagramPane1', @value=N'\[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00\]  
Begin DesignProperties \=   
   Begin PaneConfigurations \=   
      Begin PaneConfiguration \= 0  
         NumPanes \= 4  
         Configuration \= "(H (1\[16\] 4\[13\] 2\[33\] 3\) )"  
      End  
      Begin PaneConfiguration \= 1  
         NumPanes \= 3  
         Configuration \= "(H (1 \[50\] 4 \[25\] 3))"  
      End  
      Begin PaneConfiguration \= 2  
         NumPanes \= 3  
         Configuration \= "(H (1 \[50\] 2 \[25\] 3))"  
      End  
      Begin PaneConfiguration \= 3  
         NumPanes \= 3  
         Configuration \= "(H (4 \[30\] 2 \[40\] 3))"  
      End  
      Begin PaneConfiguration \= 4  
         NumPanes \= 2  
         Configuration \= "(H (1 \[56\] 3))"  
      End  
      Begin PaneConfiguration \= 5  
         NumPanes \= 2  
         Configuration \= "(H (2 \[66\] 3))"  
      End  
      Begin PaneConfiguration \= 6  
         NumPanes \= 2  
         Configuration \= "(H (4 \[50\] 3))"  
      End  
      Begin PaneConfiguration \= 7  
         NumPanes \= 1  
         Configuration \= "(V (3))"  
      End  
      Begin PaneConfiguration \= 8  
         NumPanes \= 3  
         Configuration \= "(H (1\[56\] 4\[18\] 2\) )"  
      End  
      Begin PaneConfiguration \= 9  
         NumPanes \= 2  
         Configuration \= "(H (1 \[75\] 4))"  
      End  
      Begin PaneConfiguration \= 10  
         NumPanes \= 2  
         Configuration \= "(H (1\[66\] 2\) )"  
      End  
      Begin PaneConfiguration \= 11  
         NumPanes \= 2  
         Configuration \= "(H (4 \[60\] 2))"  
      End  
      Begin PaneConfiguration \= 12  
         NumPanes \= 1  
         Configuration \= "(H (1) )"  
      End  
      Begin PaneConfiguration \= 13  
         NumPanes \= 1  
         Configuration \= "(V (4))"  
      End  
      Begin PaneConfiguration \= 14  
         NumPanes \= 1  
         Configuration \= "(V (2))"  
      End  
      ActivePaneConfig \= 0  
   End  
   Begin DiagramPane \=   
      Begin Origin \=   
         Top \= 0  
         Left \= 0  
      End  
      Begin Tables \=   
      End  
   End  
   Begin SQLPane \=   
   End  
   Begin DataPane \=   
      Begin ParameterDefaults \= ""  
      End  
      Begin ColumnWidths \= 9  
         Width \= 284  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
      End  
   End  
   Begin CriteriaPane \=   
      Begin ColumnWidths \= 11  
         Column \= 1440  
         Alias \= 900  
         Table \= 1170  
         Output \= 720  
         Append \= 1400  
         NewValue \= 1170  
         SortType \= 1350  
         SortOrder \= 1410  
         GroupBy \= 1350  
         Filter \= 1350  
         Or \= 1350  
         Or \= 1350  
         Or \= 1350  
      End  
   End  
End  
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'web\_HockyTN'  
GO

EXEC sys.sp\_addextendedproperty @name=N'MS\_DiagramPaneCount', @value=1 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'web\_HockyTN'  
GO

## \#71./\* View \[dbo\].\[web\_SinhvienTinhtrang\]    Script Date: 30/09/2025 7:49:52 AM \*\*\*\*\***Phát sinh  mới \***/

SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE VIEW \[dbo\].\[web\_SinhvienTinhtrang\]  
AS  
SELECT        MaSV, Quyetdinh, Ngaybatdau, Ngayketthuc, (CASE WHEN Noidung \= N'Chuyển học tiếp' THEN N'Chuyển học tiếp' ELSE Lydo END) AS Lydo, Quyetdinhhoctiep  
FROM            dbo.QTHoctap  
WHERE        (Noidung \= N'Bảo lưu') AND (MaSVcu IS NULL) OR  
                         (Noidung \= N'Thôi học') OR  
                         (Noidung \= N'Chuyển học tiếp')  
UNION  
SELECT        dbo.Sinhvien.MaSV, dbo.QuyetdinhTN.So, dbo.QuyetdinhTN.Ngayky, NULL AS Ngaykt, dbo.QuyetdinhTN.Noidung, '' AS Ghithem  
FROM            dbo.Sinhvien INNER JOIN  
                         dbo.QuyetdinhTN ON dbo.Sinhvien.MaQDTN \= dbo.QuyetdinhTN.MaQDTN  
GO

EXEC sys.sp\_addextendedproperty @name=N'MS\_DiagramPane1', @value=N'\[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00\]  
Begin DesignProperties \=   
   Begin PaneConfigurations \=   
      Begin PaneConfiguration \= 0  
         NumPanes \= 4  
         Configuration \= "(H (1\[22\] 4\[8\] 2\[33\] 3\) )"  
      End  
      Begin PaneConfiguration \= 1  
         NumPanes \= 3  
         Configuration \= "(H (1 \[50\] 4 \[25\] 3))"  
      End  
      Begin PaneConfiguration \= 2  
         NumPanes \= 3  
         Configuration \= "(H (1 \[50\] 2 \[25\] 3))"  
      End  
      Begin PaneConfiguration \= 3  
         NumPanes \= 3  
         Configuration \= "(H (4 \[30\] 2 \[40\] 3))"  
      End  
      Begin PaneConfiguration \= 4  
         NumPanes \= 2  
         Configuration \= "(H (1 \[56\] 3))"  
      End  
      Begin PaneConfiguration \= 5  
         NumPanes \= 2  
         Configuration \= "(H (2 \[66\] 3))"  
      End  
      Begin PaneConfiguration \= 6  
         NumPanes \= 2  
         Configuration \= "(H (4 \[50\] 3))"  
      End  
      Begin PaneConfiguration \= 7  
         NumPanes \= 1  
         Configuration \= "(V (3))"  
      End  
      Begin PaneConfiguration \= 8  
         NumPanes \= 3  
         Configuration \= "(H (1\[56\] 4\[18\] 2\) )"  
      End  
      Begin PaneConfiguration \= 9  
         NumPanes \= 2  
         Configuration \= "(H (1 \[75\] 4))"  
      End  
      Begin PaneConfiguration \= 10  
         NumPanes \= 2  
         Configuration \= "(H (1\[66\] 2\) )"  
      End  
      Begin PaneConfiguration \= 11  
         NumPanes \= 2  
         Configuration \= "(H (4 \[60\] 2))"  
      End  
      Begin PaneConfiguration \= 12  
         NumPanes \= 1  
         Configuration \= "(H (1) )"  
      End  
      Begin PaneConfiguration \= 13  
         NumPanes \= 1  
         Configuration \= "(V (4))"  
      End  
      Begin PaneConfiguration \= 14  
         NumPanes \= 1  
         Configuration \= "(V (2))"  
      End  
      ActivePaneConfig \= 0  
   End  
   Begin DiagramPane \=   
      Begin Origin \=   
         Top \= 0  
         Left \= \-952  
      End  
      Begin Tables \=   
      End  
   End  
   Begin SQLPane \=   
   End  
   Begin DataPane \=   
      Begin ParameterDefaults \= ""  
      End  
      Begin ColumnWidths \= 9  
         Width \= 284  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
         Width \= 2175  
         Width \= 1500  
         Width \= 1500  
         Width \= 1500  
      End  
   End  
   Begin CriteriaPane \=   
      Begin ColumnWidths \= 11  
         Column \= 1440  
         Alias \= 900  
         Table \= 1170  
         Output \= 720  
         Append \= 1400  
         NewValue \= 1170  
         SortType \= 1350  
         SortOrder \= 1410  
         GroupBy \= 1350  
         Filter \= 1350  
         Or \= 1350  
         Or \= 1350  
         Or \= 1350  
      End  
   End  
End  
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'web\_SinhvienTinhtrang'  
GO

EXEC sys.sp\_addextendedproperty @name=N'MS\_DiagramPaneCount', @value=1 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'web\_SinhvienTinhtrang'  
GO

